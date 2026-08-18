import { useState, useEffect } from "react";

export default function AccountsManagement() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // 1. REGISTRATION STATE
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    email: "",
    password: "",
    role: "Parent",
  });
  const [modalMessage, setModalMessage] = useState({
    text: "",
    isError: false,
  });

  // 2. VIEW ACCOUNT STATE
  const [viewAccountData, setViewAccountData] = useState({
    isOpen: false,
    account: null,
  });

  // 3. EDIT ACCOUNT STATE
  const [editAccountData, setEditAccountData] = useState({
    isOpen: false,
    accountId: null,
    firstName: "",
    middleName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    role: "Parent",
  });
  const [editMessage, setEditMessage] = useState({ text: "", isError: false });

  // EDIT CONFIRMATION MODAL STATE
  const [editConfirmation, setEditConfirmation] = useState({
    isOpen: false,
  });

  // 4. REMOVE ACCOUNT STATE
  const [deleteConfirmation, setDeleteConfirmation] = useState({
    isOpen: false,
    accountId: null,
    accountName: "",
  });

  const fetchAccounts = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/users/all", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (!response.ok) throw new Error("Failed to fetch account directory.");
      const data = await response.json();
      setAccounts(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleEditInputChange = (e) => {
    setEditAccountData({ ...editAccountData, [e.target.name]: e.target.value });
  };

  const handleCreateAccount = async (e) => {
    e.preventDefault();
    setModalMessage({ text: "", isError: false });

    try {
      const response = await fetch("http://localhost:5000/api/users/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (!response.ok)
        throw new Error(data.message || "Registration request declined.");

      setModalMessage({
        text: "Account registered successfully!",
        isError: false,
      });
      setFormData({
        firstName: "",
        middleName: "",
        lastName: "",
        email: "",
        password: "",
        role: "Parent",
      });
      fetchAccounts();

      setTimeout(() => {
        setShowModal(false);
        setModalMessage({ text: "", isError: false });
      }, 1500);
    } catch (err) {
      setModalMessage({ text: err.message, isError: true });
    }
  };

  const triggerEditAccount = (acc) => {
    setEditAccountData({
      isOpen: true,
      accountId: acc._id,
      firstName: acc.firstName || acc.firstname || "",
      middleName: acc.middleName || acc.middlename || "",
      lastName: acc.lastName || acc.lastname || "",
      email: acc.email || "",
      phone: acc.phone || "",
      address: acc.address || "",
      role: acc.role || "Parent",
    });
    setEditMessage({ text: "", isError: false });
  };

  const handleEditSubmitPrecheck = (e) => {
    e.preventDefault();
    setEditConfirmation({ isOpen: true });
  };

  const handleExecuteUpdate = async () => {
    setEditConfirmation({ isOpen: false });
    setEditMessage({ text: "", isError: false });

    try {
      const response = await fetch("http://localhost:5000/api/profile/update", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          userId: editAccountData.accountId,
          firstName: editAccountData.firstName,
          middleName: editAccountData.middleName,
          lastName: editAccountData.lastName,
          email: editAccountData.email,
          phone: editAccountData.phone,
          address: editAccountData.address,
          role: editAccountData.role,
        }),
      });

      const data = await response.json();
      if (!response.ok)
        throw new Error(data.message || "Failed to update changes.");

      await fetchAccounts();
      setEditAccountData((prev) => ({ ...prev, isOpen: false }));
    } catch (err) {
      setEditMessage({ text: err.message, isError: true });
    }
  };

  const triggerRemoveAccountConfirm = (userId, fullName, email) => {
    setDeleteConfirmation({
      isOpen: true,
      accountId: userId,
      accountName: fullName !== "No Name Provided" ? fullName : email,
    });
  };

  const handleExecuteDelete = async () => {
    const userId = deleteConfirmation.accountId;
    if (!userId) return;

    try {
      const response = await fetch(
        `http://localhost:5000/api/users/delete/${userId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to delete account.");
      }

      setAccounts(accounts.filter((acc) => acc._id !== userId));
    } catch (err) {
      alert(err.message);
    } finally {
      setDeleteConfirmation({
        isOpen: false,
        accountId: null,
        accountName: "",
      });
    }
  };

  const admins = accounts.filter((acc) => acc?.role === "Admin");
  const teachers = accounts.filter(
    (acc) => acc?.role === "Teacher" || acc?.role === "Day Care Worker",
  );
  const parents = accounts.filter(
    (acc) => acc?.role === "Parent" || !acc?.role,
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 text-slate-500 font-medium text-xs">
        Loading active database entries...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 text-red-500 font-bold text-xs">
        ⚠️ Error: {error}
      </div>
    );
  }

  const AccountSection = ({ title, icon, data, badgeColor }) => {
    if (!data || data.length === 0) return null;

    return (
      <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-base">{icon}</span>
            <h3 className="text-sm font-black text-slate-800 tracking-tight">
              {title}
            </h3>
          </div>
          <span
            className={`text-[11px] font-black px-2.5 py-0.5 rounded-full ${badgeColor}`}
          >
            {data.length} {data.length === 1 ? "Account" : "Accounts"}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                <th className="pb-3 w-[25%]">Account Name</th>
                <th className="pb-3 w-[25%]">Contact Details</th>
                <th className="pb-3 w-[30%]">Home Address</th>
                <th className="pb-3 text-right w-[20%]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {data.map((acc) => {
                if (!acc) return null;

                const userEmail = acc.email || "no-email@system.com";

                // Deep extraction fallback layers to handle whatever the backend returns
                const fName = acc.firstName || acc.firstname || acc.name || "";
                const mName = acc.middleName || acc.middlename || "";
                const lName = acc.lastName || acc.lastname || "";

                const middleInitial = mName.trim()
                  ? ` ${mName.trim().charAt(0).toUpperCase()}.`
                  : "";

                // Construct the Name format (allowing whatever casing the user typed)
                let fullName = "No Name Provided";
                if (fName || lName) {
                  fullName =
                    `${lName.trim()}, ${fName.trim()}${middleInitial}`.trim();
                }

                let initial = "U";
                if (lName.length > 0) {
                  initial = lName.charAt(0).toUpperCase();
                } else if (userEmail.length > 0) {
                  initial = userEmail.charAt(0).toUpperCase();
                }

                return (
                  <tr
                    key={acc._id || Math.random()}
                    className="hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="py-3.5 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-xs font-black text-slate-600">
                          {initial}
                        </div>
                        <div className="flex flex-col">
                          {/* Display Name as typed (No forced transformations except middle initial dot) */}
                          <span className="text-xs font-black text-slate-800">
                            {fullName}
                          </span>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                            ID: {acc._id || "N/A"}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-slate-700">
                          {userEmail}
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono tracking-wide">
                          {acc.phone || "00000000000"}
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 max-w-[240px] truncate text-xs font-semibold text-slate-600">
                      {acc.address && acc.address.trim() !== "" ? (
                        <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                          <span className="text-red-400 text-xs">📍</span>{" "}
                          {acc.address}
                        </div>
                      ) : (
                        <span className="text-slate-400 font-medium italic">
                          No address provided
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 whitespace-nowrap text-right space-x-1">
                      <button
                        onClick={() =>
                          setViewAccountData({ isOpen: true, account: acc })
                        }
                        className="text-[11px] font-bold text-blue-600 hover:text-blue-800 bg-blue-50/60 hover:bg-blue-50 px-2.5 py-1.5 rounded-xl transition"
                      >
                        View
                      </button>
                      <button
                        onClick={() => triggerEditAccount(acc)}
                        className="text-[11px] font-bold text-amber-600 hover:text-amber-800 bg-amber-50/60 hover:bg-amber-50 px-2.5 py-1.5 rounded-xl transition"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() =>
                          acc._id &&
                          triggerRemoveAccountConfirm(
                            acc._id,
                            fullName,
                            userEmail,
                          )
                        }
                        className="text-[11px] font-black text-red-500 hover:text-red-700 bg-red-50/60 hover:bg-red-50 px-2.5 py-1.5 rounded-xl transition"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-black uppercase tracking-widest text-slate-400">
            Others
          </span>
          <h2 className="text-xl font-black text-slate-800 mt-0.5">
            Account Management
          </h2>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-md transition flex items-center gap-1.5 self-start sm:self-auto"
        >
          <span>➕</span> Initialize New Account
        </button>
      </div>

      {/* GROUPS LIST */}
      <div className="space-y-6">
        <AccountSection
          title="System Administrators"
          icon="🛡️"
          data={admins}
          badgeColor="bg-red-50 text-red-600"
        />
        <AccountSection
          title="Enrolled Teachers"
          icon="🧑‍🏫"
          data={teachers}
          badgeColor="bg-blue-50 text-blue-600"
        />
        <AccountSection
          title="Enrolled Parents"
          icon="🏠"
          data={parents}
          badgeColor="bg-emerald-50 text-emerald-600"
        />
      </div>

      {/* REGISTRATION MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-2xl max-w-md w-full space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-black text-slate-800">
                Register System Profile
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateAccount} className="space-y-3">
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wide text-slate-400 mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    placeholder="Last Name"
                    className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wide text-slate-400 mb-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    placeholder="First Name"
                    className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wide text-slate-400 mb-1">
                    Middle Name
                  </label>
                  <input
                    type="text"
                    name="middleName"
                    value={formData.middleName}
                    onChange={handleInputChange}
                    placeholder="Middle Name"
                    className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-wide text-slate-400 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Email Address"
                  className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-wide text-slate-400 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="••••••••"
                  className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-wide text-slate-400 mb-1">
                  Role Type
                </label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 focus:outline-none focus:border-blue-500"
                >
                  <option value="Parent">Parent</option>
                  <option value="Teacher">Teacher</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>

              {modalMessage.text && (
                <p
                  className={`text-[11px] font-semibold ${modalMessage.isError ? "text-red-500" : "text-green-500"}`}
                >
                  {modalMessage.text}
                </p>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition"
                >
                  Create Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW INFO MODAL POPUP */}
      {viewAccountData.isOpen && viewAccountData.account && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-2xl max-w-md w-full space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-sm font-black text-slate-800">
                Detailed Account Metadata
              </h3>
              <button
                onClick={() =>
                  setViewAccountData({ isOpen: false, account: null })
                }
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3.5 text-xs text-slate-700">
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 grid grid-cols-3 gap-2">
                <div>
                  <span className="block text-[10px] font-black uppercase text-slate-400">
                    Last Name
                  </span>{" "}
                  <b className="text-slate-800">
                    {viewAccountData.account.lastName ||
                      viewAccountData.account.lastname ||
                      "-"}
                  </b>
                </div>
                <div>
                  <span className="block text-[10px] font-black uppercase text-slate-400">
                    First Name
                  </span>{" "}
                  <b className="text-slate-800">
                    {viewAccountData.account.firstName ||
                      viewAccountData.account.firstname ||
                      "-"}
                  </b>
                </div>
                <div>
                  <span className="block text-[10px] font-black uppercase text-slate-400">
                    Middle Name
                  </span>{" "}
                  <b className="text-slate-800">
                    {viewAccountData.account.middleName ||
                      viewAccountData.account.middlename ||
                      "None"}
                  </b>
                </div>
              </div>

              <div>
                <span className="block text-[10px] font-black uppercase text-slate-400 mb-0.5">
                  Assigned Core Role
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-blue-50 text-blue-600 uppercase tracking-wide">
                  {viewAccountData.account.role === "Day Care Worker"
                    ? "Teacher"
                    : viewAccountData.account.role || "Parent"}
                </span>
              </div>

              <div>
                <span className="block text-[10px] font-black uppercase text-slate-400">
                  Electronic Mail Address
                </span>
                <span className="font-mono text-slate-800 font-semibold">
                  {viewAccountData.account.email}
                </span>
              </div>

              <div>
                <span className="block text-[10px] font-black uppercase text-slate-400">
                  Registered Telephone Contact
                </span>
                <span className="font-mono text-slate-800 font-semibold">
                  {viewAccountData.account.phone || "00000000000"}
                </span>
              </div>

              <div>
                <span className="block text-[10px] font-black uppercase text-slate-400">
                  Registered Home Address Location
                </span>
                <span className="text-slate-800 font-medium">
                  {viewAccountData.account.address ||
                    "No location coordinates registered to profile."}
                </span>
              </div>
            </div>

            <button
              onClick={() =>
                setViewAccountData({ isOpen: false, account: null })
              }
              className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition"
            >
              Close Directory Info
            </button>
          </div>
        </div>
      )}

      {/* EDIT INFO MODAL POPUP */}
      {editAccountData.isOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-2xl max-w-md w-full space-y-4 animate-in fade-in zoom-in-95 duration-150 relative">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex flex-col">
                <h3 className="text-sm font-black text-slate-800">
                  Modify Account Settings
                </h3>
                <span className="text-[10px] text-slate-400 font-bold font-mono uppercase">
                  Target: {editAccountData.email}
                </span>
              </div>
              <button
                onClick={() =>
                  setEditAccountData((prev) => ({ ...prev, isOpen: false }))
                }
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleEditSubmitPrecheck} className="space-y-3">
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wide text-slate-400 mb-1">
                    Last Name
                  </label>
                  {/* Clean text inputs that accept custom casing (lowercase + uppercase values seamlessly) */}
                  <input
                    type="text"
                    name="lastName"
                    value={editAccountData.lastName}
                    onChange={handleEditInputChange}
                    placeholder="Last Name"
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wide text-slate-400 mb-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={editAccountData.firstName}
                    onChange={handleEditInputChange}
                    placeholder="First Name"
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wide text-slate-400 mb-1">
                    Middle Name
                  </label>
                  <input
                    type="text"
                    name="middleName"
                    value={editAccountData.middleName}
                    onChange={handleEditInputChange}
                    placeholder="Middle Name"
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-wide text-slate-400 mb-1">
                  System Role Assignment
                </label>
                <select
                  name="role"
                  value={
                    editAccountData.role === "Day Care Worker"
                      ? "Teacher"
                      : editAccountData.role
                  }
                  onChange={handleEditInputChange}
                  className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 focus:outline-none focus:border-blue-500"
                >
                  <option value="Parent">Parent</option>
                  <option value="Teacher">Teacher</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-wide text-slate-400 mb-1">
                  Contact Phone
                </label>
                <input
                  type="text"
                  name="phone"
                  value={editAccountData.phone}
                  onChange={handleEditInputChange}
                  placeholder="Input Phone Number"
                  className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-wide text-slate-400 mb-1">
                  Home Address Location
                </label>
                <textarea
                  name="address"
                  value={editAccountData.address}
                  onChange={handleEditInputChange}
                  placeholder="Input Address"
                  rows="2"
                  className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 focus:outline-none focus:border-blue-500 resize-none"
                  required
                />
              </div>

              {editMessage.text && editMessage.isError && (
                <p className="text-[11px] font-semibold text-red-500">
                  {editMessage.text}
                </p>
              )}

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() =>
                    setEditAccountData((prev) => ({ ...prev, isOpen: false }))
                  }
                  className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl transition shadow-sm"
                >
                  Save Profiles
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* UPDATE CONFIRMATION CHECK MODAL */}
      {editConfirmation.isOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-2xl max-w-sm w-full text-center space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center text-xl mx-auto border border-amber-100">
              📝
            </div>

            <div className="space-y-1">
              <h3 className="text-sm font-black text-slate-800">
                Confirm Account Changes?
              </h3>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                Are you sure you want to update this profile's configuration
                details?
              </p>
            </div>

            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setEditConfirmation({ isOpen: false })}
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteUpdate}
                className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow-sm transition"
              >
                Confirm Update
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REMOVE CONFIRMATION MODAL POPUP */}
      {deleteConfirmation.isOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-2xl max-w-sm w-full text-center space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center text-xl mx-auto border border-red-100">
              ⚠️
            </div>

            <div className="space-y-1">
              <h3 className="text-sm font-black text-slate-800">
                Delete System Profile?
              </h3>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                Are you certain you want to permanently remove{" "}
                <span className="font-bold text-slate-700">
                  {deleteConfirmation.accountName}
                </span>
                ? This structural baseline action cannot be undone.
              </p>
            </div>

            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={() =>
                  setDeleteConfirmation({
                    isOpen: false,
                    accountId: null,
                    accountName: "",
                  })
                }
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteDelete}
                className="w-full py-2.5 bg-red-500 hover:bg-red-600 text-white font-bold text-xs rounded-xl shadow-sm transition"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
