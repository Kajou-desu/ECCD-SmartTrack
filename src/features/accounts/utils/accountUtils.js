export const INITIAL_FORM = {
    firstName: "",
    middleName: "",
    lastName: "",
    email: "",
    password: "",
    phone: "",
    address: "",
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
        role: normalizeRole(formData.role),
        studentIds: formData.studentIds ?? [],
    };
}