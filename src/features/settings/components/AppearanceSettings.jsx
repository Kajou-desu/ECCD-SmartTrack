import { Monitor, Moon, Palette, Sun, Type } from "lucide-react";
import { useAppearance } from "@hooks/useAppearance.js";

const THEME_CHOICES = [
  { value: "system", label: "System", description: "Match your device", icon: Monitor },
  { value: "light", label: "Light", description: "Bright background", icon: Sun },
  { value: "dark", label: "Dark", description: "Easier in low light", icon: Moon },
];

// The sample letters are sized in px on purpose: they preview each option
// regardless of the size that is currently selected.
const TEXT_SIZE_CHOICES = [
  { value: "small", label: "Small", sample: "text-[13px]" },
  { value: "medium", label: "Medium", sample: "text-[15px]" },
  { value: "large", label: "Large", sample: "text-[18px]" },
];

export default function AppearanceSettings() {
  const { theme, textSize, setTheme, setTextSize } = useAppearance();

  return (
    <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6 lg:p-8">
      <div className="mb-6 flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <Palette aria-hidden="true" className="h-6 w-6 text-[#C2570C]" />
          <h2 className="text-lg font-bold text-gray-800 sm:text-xl">
            General Settings
          </h2>
        </div>
        <p className="text-sm text-gray-600">
          Choose how the app looks on this device.
        </p>
      </div>

      <div className="flex flex-col gap-8">
        <ChoiceGroup
          icon={Palette}
          title="Theme"
          name="appearance-theme"
          value={theme}
          onChange={setTheme}
          choices={THEME_CHOICES.map(({ value, label, description, icon: Icon }) => ({
            value,
            label,
            description,
            visual: <Icon aria-hidden="true" className="h-6 w-6" />,
          }))}
        />

        <ChoiceGroup
          icon={Type}
          title="Text size"
          name="appearance-text-size"
          value={textSize}
          onChange={setTextSize}
          choices={TEXT_SIZE_CHOICES.map(({ value, label, sample }) => ({
            value,
            label,
            visual: (
              <span aria-hidden="true" className={`font-semibold leading-6 ${sample}`}>
                Aa
              </span>
            ),
          }))}
        />
      </div>
    </div>
  );
}

function ChoiceGroup({ icon: Icon, title, name, value, onChange, choices }) {
  const legendId = `${name}-legend`;

  return (
    <section>
      <div className="mb-3 flex items-center gap-2">
        <Icon aria-hidden="true" className="h-5 w-5 shrink-0 text-[#C2570C]" />
        <h3 id={legendId} className="text-base font-semibold text-gray-900">
          {title}
        </h3>
      </div>

      <div
        role="radiogroup"
        aria-labelledby={legendId}
        className="grid grid-cols-1 gap-3 sm:grid-cols-3"
      >
        {choices.map((choice) => {
          const id = `${name}-${choice.value}`;
          return (
            <div key={choice.value}>
              <input
                id={id}
                type="radio"
                name={name}
                value={choice.value}
                checked={value === choice.value}
                onChange={() => onChange(choice.value)}
                className="peer sr-only"
              />
              <label
                htmlFor={id}
                className="flex h-full cursor-pointer items-center gap-3 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-4 text-gray-700 transition hover:bg-gray-100 peer-checked:border-[#C2570C] peer-checked:bg-orange-50 peer-checked:text-[#C2570C] peer-focus-visible:ring-2 peer-focus-visible:ring-[#C2570C] peer-focus-visible:ring-offset-2"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center">
                  {choice.visual}
                </span>
                <span className="min-w-0">
                  <span className="block font-medium">{choice.label}</span>
                  {choice.description && (
                    <span className="mt-0.5 block text-sm text-gray-500">
                      {choice.description}
                    </span>
                  )}
                </span>
              </label>
            </div>
          );
        })}
      </div>
    </section>
  );
}
