import { useMemo, useState } from "react";
import { Eraser, Loader2, Play, Save } from "lucide-react";
import Button from "../components/Button.jsx";
import CodeEditor from "../components/CodeEditor.jsx";
import LanguageSelector from "../components/LanguageSelector.jsx";
import ModeSelector from "../components/ModeSelector.jsx";
import OutputPanel from "../components/OutputPanel.jsx";
import { LANGUAGES, getLanguageSample } from "../constants/languages.js";
import { explainCode, generateCode, saveSnippet } from "../services/api.js";

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

export default function Practice({ auth, onNavigate }) {
  const [mode, setMode] = useState("explain");
  const [languageName, setLanguageName] = useState("JavaScript");
  const [code, setCode] = useState(getLanguageSample("JavaScript"));
  const [instruction, setInstruction] = useState("Create a button that changes text when clicked");
  const [output, setOutput] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [snippetTitle, setSnippetTitle] = useState("");
  const [savingSnippet, setSavingSnippet] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [saveError, setSaveError] = useState("");

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
    setSaveMessage("");
    setSaveError("");
  }

  function handleModeChange(nextMode) {
    setMode(nextMode);
    setOutput(null);
    setError("");
    setCopied(false);
    setSaveMessage("");
    setSaveError("");
  }

  async function handleSubmit() {
    setLoading(true);
    setError("");
    setOutput(null);
    setCopied(false);
    setSaveMessage("");
    setSaveError("");

    try {
      const response =
        mode === "explain"
          ? await explainCode(selectedLanguage.name, code, auth?.token)
          : await generateCode(selectedLanguage.name, instruction, auth?.token);

      setOutput(response);
      setSnippetTitle(`${mode === "explain" ? "Explained" : "Generated"} ${selectedLanguage.name} snippet`);
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
    setSaveMessage("");
    setSaveError("");
    setSnippetTitle("");
  }

  async function handleSaveSnippet() {
    if (!output || !auth?.token) {
      return;
    }

    const codeToSave = mode === "generate" ? cleanText(output.code) : code;

    setSavingSnippet(true);
    setSaveMessage("");
    setSaveError("");

    try {
      await saveSnippet(
        {
          title: snippetTitle.trim() || `${selectedLanguage.name} snippet`,
          language: selectedLanguage.name,
          code: codeToSave,
          explanation: output,
          mode,
        },
        auth.token,
      );
      setSaveMessage("Snippet saved.");
    } catch (caughtError) {
      setSaveError(caughtError instanceof Error ? caughtError.message : "Could not save snippet.");
    } finally {
      setSavingSnippet(false);
    }
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

        {!loading && !error && output ? (
          <section className="rounded-lg border border-zinc-200 bg-white p-4 shadow-soft lg:col-start-2 lg:p-5">
            <div className="flex flex-col gap-3">
              <div>
                <p className="text-xs font-semibold uppercase text-teal-700">Save</p>
                <h2 className="text-lg font-semibold text-zinc-950">Save this result</h2>
              </div>

              {!auth ? (
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm leading-6 text-amber-900">
                  <p>Log in to save your snippets.</p>
                  <div className="mt-3">
                    <Button variant="secondary" onClick={() => onNavigate("login")}>
                      Log in
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="grid gap-3">
                  <label className="grid gap-2 text-sm font-medium text-zinc-800">
                    Title
                    <input
                      value={snippetTitle}
                      onChange={(event) => setSnippetTitle(event.target.value)}
                      className="focus-ring h-10 rounded-lg border border-zinc-300 bg-white px-3 text-sm text-zinc-950"
                      placeholder="Give this snippet a title"
                    />
                  </label>
                  <div className="flex flex-wrap items-center gap-3">
                    <Button icon={Save} onClick={handleSaveSnippet} disabled={savingSnippet}>
                      {savingSnippet ? "Saving" : "Save snippet"}
                    </Button>
                    {saveMessage ? <p className="text-sm font-medium text-emerald-700">{saveMessage}</p> : null}
                    {saveError ? <p className="text-sm font-medium text-red-700">{saveError}</p> : null}
                  </div>
                </div>
              )}
            </div>
          </section>
        ) : null}
      </div>
    </div>
  );
}
