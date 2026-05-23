import Editor from "@monaco-editor/react";

export default function CodeEditor({ language, value, onChange }) {
  return (
    <div className="h-[420px] overflow-hidden rounded-lg border border-zinc-300 bg-white">
      <Editor
        height="100%"
        language={language.monacoId}
        theme="vs-light"
        value={value}
        onChange={(nextValue) => onChange(nextValue ?? "")}
        options={{
          automaticLayout: true,
          fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
          fontSize: 14,
          lineNumbersMinChars: 3,
          minimap: { enabled: false },
          padding: { top: 16, bottom: 16 },
          scrollBeyondLastLine: false,
          tabSize: 2,
          wordWrap: "on",
        }}
      />
    </div>
  );
}

