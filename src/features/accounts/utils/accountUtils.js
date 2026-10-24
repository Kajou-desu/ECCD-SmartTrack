import { combineAddress } from "../../students/utils/address.js";

export const INITIAL_FORM = {
    firstName: "",
    middleName: "",
    lastName: "",
    email: "",
    password: "",
    phone: "",
    address: "",
    addressProvince: "",
    addressMunicipality: "",
    addressBarangay: "",
    addressDetails: "",
    // The ECCD center of a TEACHER account (id, as a string from the select),
    // chosen by an Admin. A Parent/Guardian never has one picked: the server
    // takes it from their students' teacher.
    centerId: "",
    role: "Parent",
    studentIds: [],
};

export const INITIAL_EDIT_FORM = {
    accountId: null,
    firstName: "",
    middleName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    addressProvince: "",
    addressMunicipality: "",
    addressBarangay: "",
    addressDetails: "",
    centerId: "",
    // Only when an Admin moves a Teacher who has enrolled students: what happens
    // to them ("move" with the Teacher, or "transfer" to `newTeacherId`).
    studentAction: "",
    newTeacherId: "",
    role: "Parent",
    studentIds: [],
};

export const INITIAL_DELETE = {
    isOpen: false,
    accountId: null,
    accountName: "",
};

export const ROLES = ["Parent", "Guardian", "Teacher", "Admin"];

// Only an Admin can create Teacher or Admin accounts; a Teacher manages
// families (Parent/Guardian). This is a UI convenience only — the backend
// independently rejects any request that tries to assign or keep a role the
// caller isn't allowed to grant.
export function getAssignableRoles(actingRole) {
    return actingRole === "Admin" ? ROLES : ["Parent", "Guardian"];
}

export function getAccountId(account) {
    return account?._id || account?.id || account?.userId || null;
}

export function canModifyAccount(account, actingUser) {
    if (actingUser?.role === "Admin") return true;

    const accountId = getAccountId(account);
    const actingUserId = getAccountId(actingUser);

    return accountId === actingUserId || ["Parent", "Guardian"].includes(account?.role);
}

export function canDeleteAccount(account, actingUser) {
    return getAccountId(account) !== getAccountId(actingUser) && (
        actingUser?.role === "Admin" || ["Parent", "Guardian"].includes(account?.role)
    );
}

export function getFirstName(account) {
    return account?.firstName || account?.firstname || account?.name || "";
}

export function getMiddleName(account) {
    return account?.middleName || account?.middlename || "";
}

export function getLastName(account) {
    return account?.lastName || account?.lastname || "";
}

export function getAccountName(account) {
    const firstName = getFirstName(account).trim();
    const middleName = getMiddleName(account).trim();
    const lastName = getLastName(account).trim();

    const middleInitial = middleName
        ? ` ${middleName.charAt(0).toUpperCase()}.`
        : "";

    if (firstName || lastName) {
        return `${lastName}, ${firstName}${middleInitial}`.trim();
    }

    return account?.email || "No Name Provided";
}

export function getInitial(account) {
    const lastName = getLastName(account).trim();
    const firstName = getFirstName(account).trim();
    const email = account?.email?.trim() || "";

    return (
        lastName.charAt(0) ||
        firstName.charAt(0) ||
        email.charAt(0) ||
        "U"
    ).toUpperCase();
}

// Parents/Guardians get arrival/pickup text alerts (SMS reaches Philippine
// mobile numbers only), and the backend rejects any other phone for these roles
// — see SMS_ROLES in the backend users.controller.js. Shown up front so it
// doesn't only surface as an error after Save.
export const SMS_ROLES = ["Parent", "Guardian"];
export const PH_MOBILE_HINT =
    "Philippine mobile number, e.g. 0917 123 4567. Arrival and pickup text alerts are sent to this number.";

// The Contact Phone field holds the 10-digit mobile number without the country
// or trunk prefix (9XXXXXXXXX) — the backend adds +63 when sending. Strips
// everything but digits and drops a leading 0 / 63 so a typed "0917…", a pasted
// "+63 917…", or a legacy 11-digit value all land on the same 10 digits.
export const PHONE_DIGITS = 10;

export function toTenDigitPhone(value) {
    let digits = String(value ?? "").replace(/\D/g, "");
    if (digits.startsWith("63") && digits.length > PHONE_DIGITS) {
        digits = digits.slice(2);
    } else if (digits.startsWith("0")) {
        digits = digits.slice(1);
    }
    return digits.slice(0, PHONE_DIGITS);
}

export const ACCOUNT_PHONE_HINT =
    "Philippine mobile number, 10 digits without the leading 0, e.g. 9171234567. Arrival and pickup text alerts are sent to this number.";

export function normalizeRole(role) {
    return role === "Day Care Worker" ? "Teacher" : role || "Parent";
}

export function groupAccounts(accounts) {
    return accounts.reduce(
        (groups, account) => {
            const role = normalizeRole(account?.role);

            if (role === "Admin") {
                groups.admins.push(account);
            } else if (role === "Teacher") {
                groups.teachers.push(account);
            } else {
                if (role === "Guardian") {
                    groups.guardians.push(account);
                } else {
                    groups.parents.push(account);
                }
            }

            return groups;
        },
        {
            admins: [],
            teachers: [],
            parents: [],
            guardians: [],
        },
    );
}

// The select holds the id as a string; the API wants a number, or nothing.
export function toCenterId(value) {
    const id = Number(value);
    return Number.isInteger(id) && id > 0 ? id : undefined;
}

// Checks a NEW account before it is sent, with the same wording the server
// uses, so the person sees what to fix without a round trip. Editing is left to
// the server: a Teacher is shown only their own students on an account, so
// "no students listed" does not mean the account has none.
export function validateNewAccount(formData, actingRole) {
    const role = normalizeRole(formData.role);
    if (actingRole === "Admin" && role === "Teacher" && !toCenterId(formData.centerId)) {
        return "Choose the center for this account.";
    }
    if (["Parent", "Guardian"].includes(role) && !(formData.studentIds ?? []).length) {
        return "A Parent or Guardian account must be connected to at least one student. Select a student for this account.";
    }
    return "";
}

// Only a Teacher account carries a center; a Parent/Guardian's follows their
// students, so it is never sent (the server ignores it anyway).
function centerForRole(formData) {
    return normalizeRole(formData.role) === "Teacher" ? toCenterId(formData.centerId) : undefined;
}

export function createAccountPayload(formData) {
    // The edit-only fields stay out of a new account.
    const rest = { ...formData };
    delete rest.studentAction;
    delete rest.newTeacherId;
    return {
        ...rest,
        email: formData.email.trim().toLowerCase(),
        firstName: formData.firstName.trim(),
        middleName: formData.middleName.trim(),
        lastName: formData.lastName.trim(),
        address: combineAddress({
            province: formData.addressProvince,
            municipality: formData.addressMunicipality,
            barangay: formData.addressBarangay,
            details: formData.addressDetails,
        }),
        centerId: centerForRole(formData),
        role: normalizeRole(formData.role),
        studentIds: formData.studentIds ?? [],
    };
}

export function updateAccountPayload(formData) {
    return {
        userId: formData.accountId,
        firstName: formData.firstName.trim(),
        middleName: formData.middleName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim(),
        address: combineAddress({
            province: formData.addressProvince,
            municipality: formData.addressMunicipality,
            barangay: formData.addressBarangay,
            details: formData.addressDetails,
        }),
        centerId: centerForRole(formData),
        role: normalizeRole(formData.role),
        studentIds: formData.studentIds ?? [],
        ...studentActionFields(formData),
    };
}

// What the Admin decided for a moved Teacher's students (see getTeacherMove).
function studentActionFields(formData) {
    if (normalizeRole(formData.role) !== "Teacher") return {};
    if (formData.studentAction === "move") return { studentAction: "move" };
    if (formData.studentAction === "transfer") {
        return { studentAction: "transfer", newTeacherId: Number(formData.newTeacherId) || undefined };
    }
    return {};
}

// When saving a Teacher's account would move them to another center while
// students are enrolled with them, the Admin has to choose what happens to
// those students first. Returns null when no such choice is needed.
// `candidates` are the teachers who could take the students over: active
// Teachers at the CURRENT center (transferred students stay where they are).
// None means the transfer option is unavailable.
export function getTeacherMove(formData, account, students, accounts) {
    if (!account || normalizeRole(account.role) !== "Teacher" || normalizeRole(formData.role) !== "Teacher") return null;

    const oldCenterId = account.centerId ?? null;
    const newCenterId = toCenterId(formData.centerId) ?? null;
    if (newCenterId == null || newCenterId === oldCenterId) return null;

    const teacherId = Number(getAccountId(account));
    const enrolled = students.filter((student) => Number(student.teacherId) === teacherId).length;
    if (!enrolled) return null;

    const candidates =
        oldCenterId == null
            ? []
            : accounts.filter(
                  (other) =>
                      normalizeRole(other.role) === "Teacher" &&
                      Number(getAccountId(other)) !== teacherId &&
                      other.centerId === oldCenterId &&
                      other.isActive !== false,
              );

    return { enrolled, oldCenterId, newCenterId, candidates };
}