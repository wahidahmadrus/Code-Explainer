import { useEffect, useState } from "react";
import { AlertTriangle, Code2, Trash2 } from "lucide-react";
import Button from "../components/Button.jsx";
import { deleteSnippet, getSnippets } from "../services/api.js";

function formatDate(dateValue) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(dateValue));
}

function cleanList(items) {
  return Array.isArray(items) ? items.filter(Boolean) : [];
}

function SnippetExplanation({ explanation }) {
  if (!explanation || typeof explanation !== "object") {
    return null;
  }

  const summary = explanation.summary || explanation.explanation || "";
  const concepts = cleanList(explanation.concepts);
  const lineByLine = cleanList(explanation.lineByLine);
  const mistakes = cleanList(explanation.mistakes);

  return (
    <div className="grid gap-4 text-sm leading-6 text-zinc-700">
      {summary ? (
        <section>
          <h3 className="mb-1 font-semibold text-zinc-950">Explanation</h3>
          <p>{summary}</p>
        </section>
      ) : null}
      {lineByLine.length > 0 ? (
        <section>
          <h3 className="mb-1 font-semibold text-zinc-950">Line by line</h3>
          <ul className="grid gap-1">
            {lineByLine.map((item, index) => (
              <li key={`${index}-${item}`}>{item}</li>
            ))}
          </ul>
        </section>
      ) : null}
      {concepts.length > 0 ? (
        <section>
          <h3 className="mb-1 font-semibold text-zinc-950">Concepts</h3>
          <p>{concepts.join(", ")}</p>
        </section>
      ) : null}
      {mistakes.length > 0 ? (
        <section>
          <h3 className="mb-1 font-semibold text-zinc-950">Mistakes</h3>
          <p>{mistakes.join(" ")}</p>
        </section>
      ) : null}
    </div>
  );
}

export default function SavedSnippets({ auth, onNavigate }) {
  const [snippets, setSnippets] = useState([]);
  const [selectedSnippet, setSelectedSnippet] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function loadSnippets() {
    if (!auth?.token) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      const data = await getSnippets(auth.token);
      setSnippets(data);
      setSelectedSnippet((current) => current ?? data[0] ?? null);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Could not load saved snippets.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(snippetId) {
    setError("");

    try {
      await deleteSnippet(snippetId, auth.token);
      setSnippets((current) => current.filter((snippet) => snippet.id !== snippetId));
      setSelectedSnippet((current) => (current?.id === snippetId ? null : current));
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Could not delete snippet.");
    }
  }

  useEffect(() => {
    loadSnippets();
  }, [auth?.token]);

  if (!auth) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 lg:px-6">
        <div className="rounded-lg border border-zinc-200 bg-white p-5 shadow-soft">
          <h1 className="text-xl font-semibold text-zinc-950">Saved Snippets</h1>
          <p className="mt-2 text-sm leading-6 text-zinc-600">Log in to save and view your snippets.</p>
          <div className="mt-4">
            <Button onClick={() => onNavigate("login")}>Log in</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 lg:px-6">
      <div className="mb-5">
        <p className="text-xs font-semibold uppercase text-teal-700">History</p>
        <h1 className="mt-1 text-2xl font-semibold text-zinc-950">Saved Snippets</h1>
      </div>

      {error ? (
        <div className="mb-4 flex gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-800">
          <AlertTriangle aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
          <p>{error}</p>
        </div>
      ) : null}

      <div className="grid gap-5 lg:grid-cols-[360px_minmax(0,1fr)]">
        <section className="rounded-lg border border-zinc-200 bg-white p-4 shadow-soft">
          {loading ? <p className="text-sm text-zinc-600">Loading saved snippets...</p> : null}
          {!loading && snippets.length === 0 ? (
            <p className="text-sm leading-6 text-zinc-600">No saved snippets yet.</p>
          ) : null}
          <div className="grid gap-2">
            {snippets.map((snippet) => (
              <button
                key={snippet.id}
                type="button"
                onClick={() => setSelectedSnippet(snippet)}
                className={`focus-ring rounded-lg border p-3 text-left transition ${
                  selectedSnippet?.id === snippet.id
                    ? "border-teal-600 bg-teal-50"
                    : "border-zinc-200 bg-white hover:bg-zinc-50"
                }`}
              >
                <span className="block text-sm font-semibold text-zinc-950">{snippet.title}</span>
                <span className="mt-1 block text-xs text-zinc-500">
                  {snippet.language} - {formatDate(snippet.createdAt)}
                </span>
              </button>
            ))}
          </div>
        </section>

        <section className="rounded-lg border border-zinc-200 bg-white p-4 shadow-soft lg:p-5">
          {selectedSnippet ? (
            <div className="grid gap-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase text-teal-700">{selectedSnippet.language}</p>
                  <h2 className="mt-1 text-xl font-semibold text-zinc-950">{selectedSnippet.title}</h2>
                  <p className="mt-1 text-xs text-zinc-500">{formatDate(selectedSnippet.createdAt)}</p>
                </div>
                <Button icon={Trash2} variant="danger" onClick={() => handleDelete(selectedSnippet.id)}>
                  Delete
                </Button>
              </div>

              <div className="overflow-hidden rounded-lg border border-zinc-800 bg-zinc-950">
                <div className="flex items-center gap-2 border-b border-zinc-800 px-3 py-2 text-xs font-medium text-zinc-300">
                  <Code2 aria-hidden="true" className="h-4 w-4 text-teal-300" />
                  Code
                </div>
                <pre className="max-h-[420px] overflow-auto whitespace-pre-wrap break-words p-4 text-sm leading-6 text-zinc-50 [tab-size:2]">
                  <code>{selectedSnippet.code}</code>
                </pre>
              </div>

              <SnippetExplanation explanation={selectedSnippet.explanation} />
            </div>
          ) : (
            <p className="text-sm leading-6 text-zinc-600">Select a saved snippet to view it.</p>
          )}
        </section>
      </div>
    </div>
  );
}
