export default function AccountSettings() {
  return (
    <div className="bg-white rounded-3xl border border-gray-200 p-8 shadow-sm">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        Account Information
      </h2>

      <div className="space-y-4">
        <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
          <div>
            <p className="text-sm text-gray-600 font-medium">Account Type</p>
            <p className="font-medium text-gray-800">Parent</p>
          </div>
        </div>

        <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
          <div>
            <p className="text-sm text-gray-600 font-medium">Member Since</p>
            <p className="font-medium text-gray-800">January 2024</p>
          </div>
        </div>

        <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
          <div>
            <p className="text-sm text-gray-600 font-medium">Last Login</p>
            <p className="font-medium text-gray-800">Today at 10:30 AM</p>
          </div>
        </div>
      </div>

      <button
        type="button"
        className="w-full px-4 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition font-semibold"
      >
        Delete Account
      </button>
    </div>
  );
}
