import { API_BASE_URL } from "../config/api.js";
import { compressImage, compressImages } from "../utils/compressImage.js";

const REQUEST_TIMEOUT = 10000; // 10 seconds
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second
let onUnauthorized = null;

export function setUnauthorizedHandler(handler) {
  onUnauthorized = handler;
}

function getAuthToken() {
  return localStorage.getItem("authToken");
}
export class ApiError extends Error {
  constructor(message, status, details = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function handleApiResponse(
  response,
  handleUnauthorized = true
) {
  const contentType = response.headers.get("content-type");
  let data = {};

  if (contentType?.includes("application/json")) {
    data = await response.json().catch(() => ({}));
  }

  if (!response.ok) {
    const genericMessage = "Something went wrong.";

    if (response.status === 401 && handleUnauthorized) {
      onUnauthorized?.();
    }

    throw new ApiError(
      genericMessage,
      response.status,
      data
    );
  }

  return data;
}

async function fetchWithTimeout(url, options = {}) {
  const controller = new AbortController();

  // If caller provided an external signal, forward its abort to our internal controller
  if (options.signal) {
    if (options.signal.aborted) controller.abort();
    else
      options.signal.addEventListener("abort", () => {
        try {
          controller.abort();
        } catch {
          /* Ignore abort errors from an already-aborted controller. */
        }
      });
  }

  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

  try {
    const token = getAuthToken();
    const headers = new Headers(options.headers || {});

    if (token && !url.endsWith("/api/login")) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    return await fetch(url, {
      ...options,
      headers,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeoutId);
  }
}

async function fetchWithRetry(
  url,
  options = {},
  retries = MAX_RETRIES
) {
  const {
    handleUnauthorized = true,
    ...fetchOptions
  } = options;

  const method = (
    fetchOptions.method || "GET"
  ).toUpperCase();

  const isRetryableMethod =
    method === "GET" ||
    method === "HEAD" ||
    method === "OPTIONS";

  try {
    const response = await fetchWithTimeout(
      url,
      fetchOptions
    );

    return await handleApiResponse(
      response,
      handleUnauthorized
    );
  } catch (error) {
    const canRetry =
      isRetryableMethod &&
      (
        error.name === "AbortError" ||
        (
          error instanceof ApiError &&
          error.status >= 500
        )
      );

    if (canRetry && retries > 0) {
      await delay(
        RETRY_DELAY * (MAX_RETRIES - retries + 1)
      );

      return fetchWithRetry(
        url,
        options,
        retries - 1
      );
    }

    throw error;
  }
}

function jsonHeaders() {
  return { "Content-Type": "application/json" };
}

export const apiClient = {
  async login(email, password) {
    return fetchWithRetry(`${API_BASE_URL}/api/login`, {
      method: "POST",
      headers: jsonHeaders(),
      body: JSON.stringify({
        email: email.toLowerCase().trim(),
        password,
      }),
      handleUnauthorized: false,
    });
  },

  async requestPasswordReset(email) {
    return fetchWithRetry(`${API_BASE_URL}/api/auth/forgot-password`, {
      method: "POST",
      headers: jsonHeaders(),
      body: JSON.stringify({ email: email.toLowerCase().trim() }),
    });
  },

  async resetPassword(email, otpCode, newPassword) {
    return fetchWithRetry(`${API_BASE_URL}/api/auth/reset-password`, {
      method: "POST",
      headers: jsonHeaders(),
      body: JSON.stringify({ email: email.toLowerCase().trim(), otpCode, newPassword }),
    });
  },

  async uploadFiles(files, endpoint) {
    const formData = new FormData();
    (await compressImages(files)).forEach((file) => formData.append("files", file));

    return fetchWithRetry(`${API_BASE_URL}${endpoint}`, {
      method: "POST",
      body: formData,
    });
  },

  async getStudents(filters = {}) {
    const params = new URLSearchParams(filters);
    return fetchWithRetry(`${API_BASE_URL}/api/students?${params}`, {
      method: "GET",
    });
  },

  async getStudent(id) {
    return fetchWithRetry(`${API_BASE_URL}/api/students/${id}`, {
      method: "GET",
    });
  },

  async createStudent(studentData) {
    return fetchWithRetry(`${API_BASE_URL}/api/students`, {
      method: "POST",
      headers: jsonHeaders(),
      body: JSON.stringify(studentData),
    });
  },

  async updateStudent(id, studentData) {
    return fetchWithRetry(`${API_BASE_URL}/api/students/${id}`, {
      method: "PUT",
      headers: jsonHeaders(),
      body: JSON.stringify(studentData),
    });
  },

  async importStudents(students) {
    return fetchWithRetry(`${API_BASE_URL}/api/students/import`, {
      method: "POST",
      headers: jsonHeaders(),
      body: JSON.stringify({ students }),
    });
  },

  async deleteStudent(id) {
    return fetchWithRetry(`${API_BASE_URL}/api/students/${id}`, {
      method: "DELETE",
    });
  },

  async postFormData(endpoint, formData, extraOptions = {}) {
    return fetchWithRetry(`${API_BASE_URL}${endpoint}`, {
      ...extraOptions,
      method: "POST",
      body: formData,
    });
  },

  /**
   * Fetch attendance records for a specific date
   * @param {string|Date} date - Date in YYYY-MM-DD format or Date object
   * @returns {Promise<Array>} Array of attendance records
   * @example
   * const records = await apiClient.getAttendance('2025-01-23');
   * // or
   * const records = await apiClient.getAttendance(new Date());
   */
  async getAttendance(date) {
    const dateString = date instanceof Date ? date.toISOString().split("T")[0] : date;
    // allow callers to pass fetch options (e.g., signal)
    const options = arguments[1] || {};
    return fetchWithRetry(`${API_BASE_URL}/api/attendance?date=${dateString}`, {
      method: "GET",
      ...options,
    });
  },

  /**
   * Update a student's attendance status for a specific date
   * @param {number|string} studentId - Student ID
   * @param {string|Date} date - Date in YYYY-MM-DD format or Date object
   * @param {string} status - Status: 'present', 'absent', or 'excused'
   * @returns {Promise<Object>} Updated attendance record
   * @example
   * await apiClient.updateAttendance(1, '2025-01-23', 'present');
   * // or
   * await apiClient.updateAttendance(1, new Date(), 'absent');
   */
  async updateAttendance(studentId, date, status) {
    const dateString = date instanceof Date
      ? date.toISOString().split('T')[0]
      : date;
    return fetchWithRetry(`${API_BASE_URL}/api/attendance/${studentId}`, {
      method: "PUT",
      headers: jsonHeaders(),
      body: JSON.stringify({ date: dateString, status }),
    });
  },

  /**
   * Record attendance for multiple students (bulk operation)
   * @param {Array<Object>} attendanceData - Array of attendance records
   * @returns {Promise<Object>} Bulk operation result
   * @example
   * await apiClient.recordAttendance([
   *   { studentId: 1, date: '2025-01-23', status: 'present' },
   *   { studentId: 2, date: '2025-01-23', status: 'absent' }
   * ]);
   */
  async recordAttendance(attendanceData) {
    return fetchWithRetry(`${API_BASE_URL}/api/attendance`, {
      method: "POST",
      headers: jsonHeaders(),
      body: JSON.stringify(attendanceData),
    });
  },

  /**
   * Live attendance session (Start/Stop Attendance in the header). The server
   * decides the session's date and owner; nothing is sent in the body.
   * All three resolve to { session: {...} | null }.
   */
  async getAttendanceSession(options = {}) {
    return fetchWithRetry(`${API_BASE_URL}/api/attendance/session/current`, {
      method: "GET",
      ...options,
    });
  },

  async startAttendanceSession() {
    return fetchWithRetry(`${API_BASE_URL}/api/attendance/session/start`, {
      method: "POST",
    });
  },

  async stopAttendanceSession() {
    return fetchWithRetry(`${API_BASE_URL}/api/attendance/session/stop`, {
      method: "POST",
    });
  },

  /**
   * BLE attendance tags registered to a student (teacher/admin only). The tag's
   * address is validated again on the server; a tag belongs to exactly one student.
   */
  async getStudentBleDevices(studentId) {
    return fetchWithRetry(`${API_BASE_URL}/api/students/${studentId}/ble-devices`, { method: "GET" });
  },

  async addStudentBleDevice(studentId, deviceIdentifier) {
    return fetchWithRetry(`${API_BASE_URL}/api/students/${studentId}/ble-devices`, {
      method: "POST",
      headers: jsonHeaders(),
      body: JSON.stringify({ deviceIdentifier }),
    });
  },

  async setStudentBleDeviceEnabled(studentId, deviceId, enabled) {
    return fetchWithRetry(`${API_BASE_URL}/api/students/${studentId}/ble-devices/${deviceId}`, {
      method: "PATCH",
      headers: jsonHeaders(),
      body: JSON.stringify({ enabled }),
    });
  },

  async removeStudentBleDevice(studentId, deviceId) {
    return fetchWithRetry(`${API_BASE_URL}/api/students/${studentId}/ble-devices/${deviceId}`, {
      method: "DELETE",
    });
  },

  /**
   * Everything the live monitor shows, in one call: verified/waiting students
   * plus whether the door tag reader and face recognition are available.
   */
  async getAttendanceMonitor(options = {}) {
    return fetchWithRetry(`${API_BASE_URL}/api/attendance/session/monitor`, {
      method: "GET",
      ...options,
    });
  },

  /**
   * Sends one camera frame (a JPEG Blob) for recognition. Only pixels go up —
   * the server decides who is in the frame. Not retried (POST): the next frame
   * supersedes a lost one.
   */
  async sendAttendanceFrame(blob, options = {}) {
    const formData = new FormData();
    formData.append("frame", blob, "frame.jpg");
    return fetchWithRetry(`${API_BASE_URL}/api/attendance/session/frame`, {
      method: "POST",
      body: formData,
      signal: options.signal,
    });
  },

  /**
   * Fetch all photo albums (teacher + parent views share this list).
   * @returns {Promise<Array>} Array of album records
   */
  async getAlbums() {
    return fetchWithRetry(`${API_BASE_URL}/api/albums`, {
      method: "GET",
    });
  },

  /**
   * Create a new (empty) photo album.
   * @param {string} title
   */
  async createAlbum(title) {
    return fetchWithRetry(`${API_BASE_URL}/api/albums`, {
      method: "POST",
      headers: jsonHeaders(),
      body: JSON.stringify({ title }),
    });
  },

  /**
   * Delete an album (and its photos).
   * @param {number|string} albumId
   */
  async updateAlbum(albumId, payload) {
    return fetchWithRetry(`${API_BASE_URL}/api/albums/${albumId}`, {
      method: "PUT",
      headers: jsonHeaders(),
      body: JSON.stringify(payload),
    });
  },

  async deleteAlbum(albumId) {
    return fetchWithRetry(`${API_BASE_URL}/api/albums/${albumId}`, {
      method: "DELETE",
    });
  },

  /**
   * Upload one or more photos into an album.
   * @param {number|string} albumId
   * @param {File[]} files
   * @returns {Promise<Array>} Array of created photo records
   */
  async addAlbumPhotos(albumId, files) {
    const formData = new FormData();
    (await compressImages(files)).forEach((file) => formData.append("photos", file));

    return fetchWithRetry(`${API_BASE_URL}/api/albums/${albumId}/photos`, {
      method: "POST",
      body: formData,
    });
  },

  /**
   * Delete a single photo from an album.
   * @param {number|string} albumId
   * @param {number|string} photoId
   */
  async deleteAlbumPhoto(albumId, photoId) {
    return fetchWithRetry(`${API_BASE_URL}/api/albums/${albumId}/photos/${photoId}`, {
      method: "DELETE",
    });
  },

  /**
   * Fetch all learning materials (teacher + parent views share this list).
   * @returns {Promise<Array>} Array of material records
   */
  async getMaterials() {
    return fetchWithRetry(`${API_BASE_URL}/api/materials`, {
      method: "GET",
    });
  },

  /**
   * Create a new learning material.
   * @param {Object} materialData - { title, category, description, file }
   */
  async createMaterial(materialData) {
    const { file, ...fields } = materialData;
    const formData = new FormData();
    Object.entries(fields).forEach(([key, value]) => formData.append(key, value));
    if (file instanceof File) formData.append("file", await compressImage(file));

    return fetchWithRetry(`${API_BASE_URL}/api/materials`, {
      method: "POST",
      body: formData,
    });
  },

  /**
   * Update an existing material.
   * @param {number|string} id
   * @param {Object} materialData
   */
  async updateMaterial(id, materialData) {
    const { file, ...fields } = materialData;
    const formData = new FormData();
    Object.entries(fields).forEach(([key, value]) => formData.append(key, value));
    if (file instanceof File) formData.append("file", await compressImage(file));

    return fetchWithRetry(`${API_BASE_URL}/api/materials/${id}`, {
      method: "PUT",
      body: formData,
    });
  },

  /**
   * Delete a material.
   * @param {number|string} id
   */
  async deleteMaterial(id) {
    return fetchWithRetry(`${API_BASE_URL}/api/materials/${id}`, {
      method: "DELETE",
    });
  },

  /**
   * Fetch a child's submitted/completed work for materials.
   * @param {number|string} childId
   * @returns {Promise<Array>} Array of { materialId, fileUrl, submittedAt }
   */
  async getSubmissions(childId) {
    return fetchWithRetry(`${API_BASE_URL}/api/students/${childId}/submissions`, {
      method: "GET",
    });
  },

  /**
   * Upload a child's completed work for a material.
   * @param {Object} params - { materialId, studentId, file }
   * @returns {Promise<Object>} Created submission record
   */
  async submitStudentWork({ materialId, studentId, file }) {
    const formData = new FormData();
    formData.append("materialId", materialId);
    formData.append("studentId", studentId);
    formData.append("file", await compressImage(file));

    return fetchWithRetry(`${API_BASE_URL}/api/submissions`, {
      method: "POST",
      body: formData,
    });
  },

  /**
   * Upload one or more documents to a student's profile.
   * @param {number|string} studentId
   * @param {File[]} files
   * @returns {Promise<Array>} Array of created document records
   */
  async uploadStudentDocuments(studentId, files) {
    const formData = new FormData();
    (await compressImages(files)).forEach((file) => formData.append("documents", file));

    return fetchWithRetry(`${API_BASE_URL}/api/students/${studentId}/documents`, {
      method: "POST",
      body: formData,
    });
  },

  /**
   * Delete a single document from a student's profile.
   * @param {number|string} studentId
   * @param {number|string} documentId
   */
  async deleteStudentDocument(studentId, documentId) {
    return fetchWithRetry(`${API_BASE_URL}/api/students/${studentId}/documents/${documentId}`, {
      method: "DELETE",
    });
  },

  /** Fetch the full account directory (admin/teacher account management). */
  async getAccounts() {
    return fetchWithRetry(`${API_BASE_URL}/api/users/all`, {
      method: "GET",
    });
  },

  /** @param {Object} payload - New account fields (name, email, password, role, ...) */
  async createAccount(payload) {
    return fetchWithRetry(`${API_BASE_URL}/api/users/register`, {
      method: "POST",
      headers: jsonHeaders(),
      body: JSON.stringify(payload),
    });
  },

  /** @param {Object} payload - Updated account fields, including the account id */
  async updateAccount(payload) {
    return fetchWithRetry(`${API_BASE_URL}/api/profile/update`, {
      method: "PUT",
      headers: jsonHeaders(),
      body: JSON.stringify(payload),
    });
  },

  /** @param {number|string} accountId */
  async deleteAccount(accountId) {
    return fetchWithRetry(`${API_BASE_URL}/api/users/delete/${accountId}`, {
      method: "DELETE",
    });
  },

  /**
   * Self-service profile update (name/email/phone/address). Never accepts
   * a role change — see users.controller.js on the backend.
   * @param {Object} payload
   */
  async updateMyProfile(payload) {
    return fetchWithRetry(`${API_BASE_URL}/api/profile/me`, {
      method: "PUT",
      headers: jsonHeaders(),
      body: JSON.stringify(payload),
      // A wrong current password comes back as a 401; that must show as a
      // form error, not sign the user out (same as changeMyPassword).
      handleUnauthorized: false,
    });
  },

  /**
   * Self-service profile picture upload.
   * @param {File} file
   */
  async uploadMyProfilePhoto(file) {
    const formData = new FormData();
    formData.append("photo", await compressImage(file));

    return fetchWithRetry(`${API_BASE_URL}/api/profile/me/photo`, {
      method: "POST",
      body: formData,
    });
  },

  /**
   * Self-service password change. Returns a fresh token on success (the
   * old one is invalidated everywhere, including this session, unless the
   * caller swaps in the returned token).
   * @param {string} currentPassword
   * @param {string} newPassword
   */
  async requestPasswordChangeOtp() {
    return fetchWithRetry(`${API_BASE_URL}/api/profile/me/password/request-otp`, { method: "POST" });
  },

  async changeMyPassword(currentPassword, newPassword, otpCode) {
    return fetchWithRetry(`${API_BASE_URL}/api/profile/me/password`, {
      method: "PUT",
      headers: jsonHeaders(),
      body: JSON.stringify({ currentPassword, newPassword, otpCode }),
      handleUnauthorized: false,
    });
  },

  /**
   * Self-service account deletion (delete your own account). Requires
   * re-entering the current password as confirmation.
   * @param {string} password
   */
  async requestAccountDeletionOtp() {
    return fetchWithRetry(`${API_BASE_URL}/api/profile/me/delete/request-otp`, { method: "POST" });
  },

  async deleteMyAccount(password, otpCode) {
    return fetchWithRetry(`${API_BASE_URL}/api/profile/me`, {
      method: "DELETE",
      headers: jsonHeaders(),
      body: JSON.stringify({ password, otpCode }),
      handleUnauthorized: false,
    });
  },

  // --- Endpoints without a confirmed backend contract yet ---
  // Names/shapes not yet confirmed with backend; adjust once real contract exists.

  /** @param {number|string} childId @param {string} monthKey e.g. "2026-08" */
  async getChildAttendance(childId, monthKey) {
    return fetchWithRetry(`${API_BASE_URL}/api/students/${childId}/attendance?month=${monthKey}`, {
      method: "GET",
    });
  },

  /** @param {number|string} childId */
  async getChildProgress(childId) {
    return fetchWithRetry(`${API_BASE_URL}/api/students/${childId}/progress`, {
      method: "GET",
    });
  },

  /** List children linked to the logged-in parent account. */
  async getChildren() {
    return fetchWithRetry(`${API_BASE_URL}/api/parent/children`, {
      method: "GET",
    });
  },

  /** @param {string} monthKey e.g. "2026-08" */
  async getEvents(monthKey) {
    return fetchWithRetry(`${API_BASE_URL}/api/events?month=${monthKey}`, {
      method: "GET",
    });
  },

  /**
   * @param {Object} payload
   * @param {string} payload.title
   * @param {string} payload.date - "YYYY-MM-DD"
   * @param {"Holiday"|"Birthday"|"Others"} payload.category
   * @param {string} [payload.description]
   */
  async createEvent(payload) {
    return fetchWithRetry(`${API_BASE_URL}/api/events`, {
      method: "POST",
      headers: jsonHeaders(),
      body: JSON.stringify(payload),
    });
  },

  /** Aggregate counts for the teacher dashboard stat cards. */
  async getDashboardStats() {
    return fetchWithRetry(`${API_BASE_URL}/api/dashboard/stats`, {
      method: "GET",
    });
  },

  /** Today's lesson theme shown on the teacher dashboard. */
  async getDailyTheme() {
    return fetchWithRetry(`${API_BASE_URL}/api/dashboard/daily-theme`, {
      method: "GET",
    });
  },

  /** Fetch notifications for the current user. */
  async getNotifications({ unreadOnly = false } = {}) {
    const params = new URLSearchParams();

    if (unreadOnly) {
      params.set("unread", "true");
    }

    const queryString = params.toString();

    return fetchWithRetry(`${API_BASE_URL}/api/notifications${queryString ? `?${queryString}` : ""}`, {
      method: "GET",
    });
  },

  /** Mark a specific notification as read. */
  async markNotificationRead(notificationId) {
    return fetchWithRetry(`${API_BASE_URL}/api/notifications/${notificationId}/read`, {
      method: "PATCH",
      headers: jsonHeaders(),
      body: JSON.stringify({ read: true }),
    });
  },

  /** Mark all notifications as read for the current user. */
  async markAllNotificationsRead() {
    return fetchWithRetry(`${API_BASE_URL}/api/notifications/read-all`, {
      method: "PATCH",
      headers: jsonHeaders(),
      body: JSON.stringify({ read: true }),
    });
  },

  /** Dismiss a single notification. */
  async dismissNotification(notificationId) {
    return fetchWithRetry(`${API_BASE_URL}/api/notifications/${notificationId}`, {
      method: "DELETE",
    });
  },

  /** Remove all notifications for the current user. */
  async dismissAllNotifications() {
    return fetchWithRetry(`${API_BASE_URL}/api/notifications`, {
      method: "DELETE",
    });
  },
};