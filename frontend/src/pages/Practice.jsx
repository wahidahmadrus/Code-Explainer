import { useMemo, useState } from "react";
import { Eraser, Loader2, Play } from "lucide-react";
import Button from "../components/Button.jsx";
import CodeEditor from "../components/CodeEditor.jsx";
import LanguageSelector from "../components/LanguageSelector.jsx";
import ModeSelector from "../components/ModeSelector.jsx";
import OutputPanel from "../components/OutputPanel.jsx";
import { LANGUAGES, getLanguageSample } from "../constants/languages.js";
import { explainCode, generateCode } from "../services/api.js";

function cleanText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function cleanList(items) {
  return Array.isArray(items) ? items.map(cleanText).filter(Boolean) : [];
}

function formatOutput(mode, output) {
  if (!output) {
    return "";
  }

  const concepts = cleanList(output.concepts);
  const improvedCode = cleanText(output.improvedCode);
  const lineByLine = cleanList(output.lineByLine);
  const mistakes = cleanList(output.mistakes);

  if (mode === "generate") {
    return [
      cleanText(output.code),
      cleanText(output.explanation) ? `Explanation:\n${cleanText(output.explanation)}` : "",
      concepts.length > 0 ? `Concepts:\n${concepts.join(", ")}` : "",
    ]
      .filter(Boolean)
      .join("\n\n");
  }

  return [
    cleanText(output.summary) ? `Summary:\n${cleanText(output.summary)}` : "",
    lineByLine.length > 0 ? `Line by line:\n${lineByLine.join("\n")}` : "",
    concepts.length > 0 ? `Concepts:\n${concepts.join(", ")}` : "",
    mistakes.length > 0 ? `Beginner mistakes:\n${mistakes.join("\n")}` : "",
    improvedCode ? `Improved code:\n${improvedCode}` : "",
  ]
    .filter(Boolean)
    .join("\n\n");
}

export default function Practice() {
  const [mode, setMode] = useState("explain");
  const [languageName, setLanguageName] = useState("JavaScript");
  const [code, setCode] = useState(getLanguageSample("JavaScript"));
  const [instruction, setInstruction] = useState("Create a button that changes text when clicked");
  const [output, setOutput] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const selectedLanguage = useMemo(
    () => LANGUAGES.find((language) => language.name === languageName) ?? LANGUAGES[0],
    [languageName],
  );

  const canSubmit = mode === "explain" ? code.trim().length > 0 : instruction.trim().length > 0;

  function handleLanguageChange(nextLanguageName) {
    const currentSample = getLanguageSample(languageName);
    setLanguageName(nextLanguageName);

    if (!code.trim() || code === currentSample) {
      setCode(getLanguageSample(nextLanguageName));
    }

    setOutput(null);
    setError("");
  }

  function handleModeChange(nextMode) {
    setMode(nextMode);
    setOutput(null);
    setError("");
    setCopied(false);
  }

  async function handleSubmit() {
    setLoading(true);
    setError("");
    setOutput(null);
    setCopied(false);

    try {
      const response =
        mode === "explain"
          ? await explainCode(selectedLanguage.name, code)
          : await generateCode(selectedLanguage.name, instruction);

      setOutput(response);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleCopy() {
    if (!output) {
      return;
    }

    await navigator.clipboard.writeText(formatOutput(mode, output));
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  }

  function handleClear() {
    if (mode === "explain") {
      setCode("");
    } else {
      setInstruction("");
    }

    setOutput(null);
    setError("");
    setCopied(false);
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 lg:px-6">
      <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase text-teal-700">Practice</p>
          <h1 className="mt-1 text-2xl font-semibold text-zinc-950">Programming Workspace</h1>
        </div>
        <div className="grid gap-3 sm:grid-cols-[220px_minmax(320px,420px)]">
          <LanguageSelector languages={LANGUAGES} value={languageName} onChange={handleLanguageChange} />
          <ModeSelector value={mode} onChange={handleModeChange} />
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.05fr)_minmax(360px,0.95fr)]">
        <section className="rounded-lg border border-zinc-200 bg-white p-4 shadow-soft lg:p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase text-teal-700">
                {mode === "explain" ? `${selectedLanguage.fileExtension} editor` : "Instruction"}
              </p>
              <h2 className="text-lg font-semibold text-zinc-950">
                {mode === "explain" ? "Code Input" : "Build Request"}
              </h2>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button icon={Eraser} variant="secondary" onClick={handleClear} disabled={loading}>
                Clear
              </Button>
              <Button
                icon={loading ? Loader2 : Play}
                iconClassName={loading ? "animate-spin" : ""}
                onClick={handleSubmit}
                disabled={!canSubmit || loading}
              >
                {loading
                  ? mode === "explain"
                    ? "Thinking"
                    : "Generating"
                  : mode === "explain"
                    ? "Explain"
                    : "Generate"}
              </Button>
            </div>
          </div>

          {mode === "explain" ? (
            <CodeEditor language={selectedLanguage} value={code} onChange={setCode} />
          ) : (
            <textarea
              value={instruction}
              onChange={(event) => setInstruction(event.target.value)}
              className="focus-ring min-h-[420px] w-full resize-none rounded-lg border border-zinc-300 bg-white p-4 text-sm leading-6 text-zinc-950 placeholder:text-zinc-400"
              placeholder="Describe what you want to build..."
            />
          )}
        </section>

        <OutputPanel
          mode={mode}
          output={output}
          error={error}
          loading={loading}
          copied={copied}
          onCopy={handleCopy}
        />
      </div>
    </div>
  );
}
