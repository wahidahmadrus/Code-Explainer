export default function LanguageSelector({ languages, value, onChange }) {
  return (
    <label className="grid gap-2 text-sm font-medium text-zinc-800">
      Language
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="focus-ring h-10 rounded-lg border border-zinc-300 bg-white px-3 text-sm text-zinc-950"
      >
        {languages.map((language) => (
          <option key={language.name} value={language.name}>
            {language.name}
          </option>
        ))}
      </select>
    </label>
  );
}

