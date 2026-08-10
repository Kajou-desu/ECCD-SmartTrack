import { API_BASE_URL } from "../config/api.js";

const REQUEST_TIMEOUT = 10000; // 10 seconds
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

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

async function handleApiResponse(response) {
  const contentType = response.headers.get("content-type");
  let data = {};

  if (contentType?.includes("application/json")) {
    data = await response.json().catch(() => ({}));
  }

  if (!response.ok) {
    const message = data.message || `HTTP ${response.status}`;
    throw new ApiError(message, response.status, data);
  }

  return data;
}

async function fetchWithTimeout(url, options = {}) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      credentials: options.credentials ?? "include",
    });
    return response;
  } finally {
    clearTimeout(timeoutId);
  }
}

async function fetchWithRetry(url, options = {}, retries = MAX_RETRIES) {
  try {
    const response = await fetchWithTimeout(url, options);
    return await handleApiResponse(response);
  } catch (error) {
    const canRetry =
      error.name === "AbortError" ||
      (error instanceof ApiError && error.status >= 500);

    if (canRetry && retries > 0) {
      await delay(RETRY_DELAY * (MAX_RETRIES - retries + 1));
      return fetchWithRetry(url, options, retries - 1);
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
      body: JSON.stringify({ email: email.toLowerCase().trim(), password }),
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
    files.forEach((file) => formData.append("files", file));

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

  async deleteStudent(id) {
    return fetchWithRetry(`${API_BASE_URL}/api/students/${id}`, {
      method: "DELETE",
    });
  },

  async postFormData(endpoint, formData, extraOptions = {}) {
    return fetchWithRetry(`${API_BASE_URL}${endpoint}`, {
      method: "POST",
      body: formData,
      ...extraOptions,
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
    const dateString = date instanceof Date
      ? date.toISOString().split('T')[0]
      : date;
    return fetchWithRetry(`${API_BASE_URL}/api/attendance?date=${dateString}`, {
      method: "GET",
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
};