export const INITIAL_FORM = {
    firstName: "",
    middleName: "",
    lastName: "",
    email: "",
    password: "",
    phone: "",
    address: "",
    // Which ECCD center a Teacher account is based at; not shown/used for
    // other roles.
    centerLocation: "",
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
    centerLocation: "",
    role: "Parent",
    studentIds: [],
};

export const INITIAL_DELETE = {
    isOpen: false,
    accountId: null,
    accountName: "",
};

export const ROLES = ["Parent", "Guardian", "Teacher", "Admin"];

// Only an Admin can grant the Admin role. This is a UI convenience only —
// the backend must independently reject any request that tries to assign
// or keep a role the caller isn't allowed to grant.
export function getAssignableRoles(actingRole) {
    return actingRole === "Admin" ? ROLES : ROLES.filter((role) => role !== "Admin");
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

// Parents/Guardians get arrival/departure text alerts (SMS reaches Philippine
// mobile numbers only), and the backend rejects any other phone for these roles
// — see SMS_ROLES in the backend users.controller.js. Shown up front so it
// doesn't only surface as an error after Save.
export const SMS_ROLES = ["Parent", "Guardian"];
export const PH_MOBILE_HINT =
    "Philippine mobile number, e.g. 0917 123 4567. Arrival and departure text alerts are sent to this number.";

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
    "Philippine mobile number, 10 digits without the leading 0, e.g. 9171234567. Arrival and departure text alerts are sent to this number.";

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

export function createAccountPayload(formData) {
    return {
        ...formData,
        email: formData.email.trim().toLowerCase(),
        firstName: formData.firstName.trim(),
        middleName: formData.middleName.trim(),
        lastName: formData.lastName.trim(),
        centerLocation: (formData.centerLocation ?? "").trim(),
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
        address: formData.address.trim(),
        centerLocation: (formData.centerLocation ?? "").trim(),
        role: normalizeRole(formData.role),
        studentIds: formData.studentIds ?? [],
    };
}