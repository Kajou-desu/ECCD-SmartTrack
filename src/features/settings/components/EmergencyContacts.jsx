import { useState } from "react";
import { Phone, Plus, Trash2 } from "lucide-react";

export default function EmergencyContacts() {
  const [showAddContact, setShowAddContact] = useState(false);
  const [newContact, setNewContact] = useState({
    name: "",
    relation: "",
    phone: "",
  });
  const [emergencyContacts, setEmergencyContacts] = useState([
    {
      id: 1,
      name: "Maria Macaraeg",
      relation: "Mother",
      phone: "+63 9198765432",
    },
  ]);

  const handleAddContact = () => {
    if (newContact.name && newContact.relation && newContact.phone) {
      setEmergencyContacts([
        ...emergencyContacts,
        { ...newContact, id: Date.now() },
      ]);
      setNewContact({ name: "", relation: "", phone: "" });
      setShowAddContact(false);
    }
  };

  const handleRemoveContact = (id) => {
    setEmergencyContacts(
      emergencyContacts.filter((contact) => contact.id !== id),
    );
  };

  return (
    <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Phone className="h-6 w-6 text-[#C2570C]" />
          <h2 className="text-2xl font-bold text-gray-800">
            Emergency Contacts
          </h2>
        </div>
        <button
          onClick={() => setShowAddContact(true)}
          className="bg-[#C2570C] hover:bg-orange-800 text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center gap-2"
        >
          <Plus className="h-5 w-5" />
          Add Contact
        </button>
      </div>

      {/* Add Contact Form */}
      {showAddContact && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-3">
          <input
            type="text"
            placeholder="Contact Name"
            value={newContact.name}
            onChange={(e) =>
              setNewContact({ ...newContact, name: e.target.value })
            }
            className="w-full border border-gray-200 rounded-lg p-2.5 text-sm outline-none focus:border-[#C2570C] transition"
          />
          <input
            type="text"
            placeholder="Relation (e.g., Mother, Father, Guardian)"
            value={newContact.relation}
            onChange={(e) =>
              setNewContact({ ...newContact, relation: e.target.value })
            }
            className="w-full border border-gray-200 rounded-lg p-2.5 text-sm outline-none focus:border-[#C2570C] transition"
          />
          <input
            type="tel"
            placeholder="Phone Number (e.g., +63 9198765432)"
            value={newContact.phone}
            onChange={(e) =>
              setNewContact({ ...newContact, phone: e.target.value })
            }
            className="w-full border border-gray-200 rounded-lg p-2.5 text-sm outline-none focus:border-[#C2570C] transition"
          />
          <div className="flex gap-3">
            <button
              onClick={handleAddContact}
              className="flex-1 bg-[#C2570C] hover:bg-orange-800 text-white font-semibold py-2 rounded-lg transition-colors"
            >
              Add Contact
            </button>
            <button
              onClick={() => setShowAddContact(false)}
              className="flex-1 border border-gray-200 text-gray-700 font-semibold py-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Emergency Contacts List */}
      <div className="space-y-3">
        {emergencyContacts.length === 0 ? (
          <p className="text-gray-500 text-center py-4">
            No emergency contacts added yet
          </p>
        ) : (
          emergencyContacts.map((contact) => (
            <div
              key={contact.id}
              className="flex justify-between items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
            >
              <div className="flex-1">
                <p className="font-medium text-gray-800">{contact.name}</p>
                <p className="text-sm text-gray-600">{contact.relation}</p>
                <p className="text-sm text-gray-500">{contact.phone}</p>
              </div>
              <button
                onClick={() => handleRemoveContact(contact.id)}
                className="text-red-600 hover:text-red-800 transition ml-4"
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
