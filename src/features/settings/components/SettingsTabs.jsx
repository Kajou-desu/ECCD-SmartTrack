const tabId = (id) => `settings-tab-${id}`;
const panelId = (id) => `settings-panel-${id}`;

export function SettingsTabs({ tabs, activeTab, onChange }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-2 shadow-sm">
      <div
        role="tablist"
        aria-label="Settings sections"
        className="flex flex-wrap justify-center items-center gap-2"
      >
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            id={tabId(id)}
            type="button"
            role="tab"
            aria-selected={activeTab === id}
            aria-controls={panelId(id)}
            onClick={() => onChange(id)}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-200
          ${
            activeTab === id
              ? "bg-[#C2570C] text-white shadow-sm"
              : "text-gray-600 hover:bg-orange-50 hover:text-[#C2570C]"
          }`}
          >
            <Icon className="h-4 w-4" aria-hidden="true" />
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}

// Render only the active tab's panel.
export function SettingsTabPanel({ id, className, children }) {
  return (
    <div role="tabpanel" id={panelId(id)} aria-labelledby={tabId(id)} className={className}>
      {children}
    </div>
  );
}
