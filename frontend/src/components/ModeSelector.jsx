import { FileSearch, WandSparkles } from "lucide-react";

const modes = [
  {
    id: "explain",
    label: "Explain Code",
    icon: FileSearch,
  },
  {
    id: "generate",
    label: "Generate Code",
    icon: WandSparkles,
  },
];

export default function ModeSelector({ value, onChange }) {
  return (
    <div className="grid gap-2">
      <span className="text-sm font-medium text-zinc-800">Mode</span>
      <div className="grid grid-cols-2 rounded-lg border border-zinc-300 bg-white p-1">
        {modes.map((mode) => {
          const Icon = mode.icon;
          const isActive = value === mode.id;

          return (
            <button
              key={mode.id}
              type="button"
              onClick={() => onChange(mode.id)}
              className={`focus-ring flex min-h-10 items-center justify-center gap-2 rounded-md px-3 text-sm font-medium transition ${
                isActive ? "bg-zinc-950 text-white shadow-sm" : "text-zinc-700 hover:bg-zinc-100"
              }`}
            >
              <Icon aria-hidden="true" className="h-4 w-4 shrink-0" />
              <span className="truncate">{mode.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

