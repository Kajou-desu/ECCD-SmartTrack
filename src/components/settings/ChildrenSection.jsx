import { useState } from "react";
import { Heart, Plus, Trash2 } from "lucide-react";

export default function ChildrenSection() {
  const [showAddChild, setShowAddChild] = useState(false);
  const [newChild, setNewChild] = useState({
    name: "",
    schoolId: "",
  });
  const [children, setChildren] = useState([
    { id: 1, name: "Leo Miller", session: "Morning (am)", schoolId: "POB2-2026-001" },
  ]);

  const handleAddChild = () => {
    if (newChild.name && newChild.session) {
      setChildren([...children, { ...newChild, id: Date.now() }]);
      setNewChild({ name: "", session: "", schoolId: "" });
      setShowAddChild(false);
    }
  };

  const handleRemoveChild = (id) => {
    setChildren(children.filter((child) => child.id !== id));
  };

  return (
    <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Heart className="h-6 w-6 text-[#C2570C]" />
          <h2 className="text-2xl font-bold text-gray-800">Children</h2>
        </div>
        <button
          onClick={() => setShowAddChild(true)}
          className="bg-[#C2570C] hover:bg-orange-800 text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center gap-2"
        >
          <Plus className="h-5 w-5" />
          Add Child
        </button>
      </div>

      {/* Add Child Form */}
      {showAddChild && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-3">
          <input
            type="text"
            placeholder="Child's Name"
            value={newChild.name}
            onChange={(e) => setNewChild({ ...newChild, name: e.target.value })}
            className="w-full border border-gray-200 rounded-lg p-2.5 text-sm outline-none focus:border-[#C2570C] transition"
          />
          <input
            type="text"
            placeholder="Session (Morning (am) or Afternoon (pm))"
            value={newChild.session}
            onChange={(e) =>
              setNewChild({ ...newChild, session: e.target.value })
            }
            className="w-full border border-gray-200 rounded-lg p-2.5 text-sm outline-none focus:border-[#C2570C] transition"
          />
          <input
            type="text"
            placeholder="School ID (optional)"
            value={newChild.schoolId}
            onChange={(e) =>
              setNewChild({ ...newChild, schoolId: e.target.value })
            }
            className="w-full border border-gray-200 rounded-lg p-2.5 text-sm outline-none focus:border-[#C2570C] transition"
          />
          <div className="flex gap-3">
            <button
              onClick={handleAddChild}
              className="flex-1 bg-[#C2570C] hover:bg-orange-800 text-white font-semibold py-2 rounded-lg transition-colors"
            >
              Add Child
            </button>
            <button
              onClick={() => setShowAddChild(false)}
              className="flex-1 border border-gray-200 text-gray-700 font-semibold py-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Children List */}
      <div className="space-y-3">
        {children.length === 0 ? (
          <p className="text-gray-500 text-center py-4">
            No children added yet
          </p>
        ) : (
          children.map((child) => (
            <div
              key={child.id}
              className="flex justify-between items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
            >
              <div>
                <p className="font-medium text-gray-800">{child.name}</p>
                <p className="text-sm text-gray-600">{child.session}</p>
                {child.schoolId && (
                  <p className="text-xs text-gray-500">ID: {child.schoolId}</p>
                )}
              </div>
              <button
                onClick={() => handleRemoveChild(child.id)}
                className="text-red-600 hover:text-red-800 transition"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
