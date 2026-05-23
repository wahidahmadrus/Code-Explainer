import { Eye, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";
import DataTable from "../components/DataTable.jsx";
import { deleteSnippet, getSnippet, getSnippets } from "../services/adminApi.js";

function formatDate(value) {
  return value ? new Date(value).toLocaleString() : "Unknown";
}

function PreviewPanel({ snippet, onClose }) {
  if (!snippet) {
    return null;
  }

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-950">{snippet.title}</h3>
          <p className="mt-1 text-sm text-slate-500">
            {snippet.language} · {snippet.mode} · {snippet.user?.email || "Unknown user"}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="focus-ring inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-300 text-slate-600 hover:bg-slate-50"
          aria-label="Close snippet details"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-2">
        <div>
          <h4 className="text-sm font-semibold text-slate-700">Code</h4>
          <pre className="mt-2 max-h-96 overflow-auto rounded-md bg-slate-950 p-4 text-sm text-slate-50">
            <code>{snippet.code}</code>
          </pre>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-slate-700">Explanation</h4>
          <pre className="mt-2 max-h-96 overflow-auto rounded-md bg-slate-100 p-4 text-sm text-slate-800">
            <code>{JSON.stringify(snippet.explanation, null, 2)}</code>
          </pre>
        </div>
      </div>
    </section>
  );
}

export default function Snippets() {
  const [snippets, setSnippets] = useState([]);
  const [selectedSnippet, setSelectedSnippet] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [actionId, setActionId] = useState("");

  async function loadSnippets() {
    setError("");
    setIsLoading(true);

    try {
      setSnippets(await getSnippets());
    } catch (loadError) {
      setError(loadError.message || "Could not load snippets.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadSnippets();
  }, []);

  async function handleView(id) {
    setError("");
    setActionId(id);

    try {
      setSelectedSnippet(await getSnippet(id));
    } catch (viewError) {
      setError(viewError.message || "Could not load snippet details.");
    } finally {
      setActionId("");
    }
  }

  async function handleDelete(id) {
    const shouldDelete = window.confirm("Delete this snippet?");

    if (!shouldDelete) {
      return;
    }

    setError("");
    setActionId(id);

    try {
      await deleteSnippet(id);
      setSnippets((currentSnippets) => currentSnippets.filter((snippet) => snippet.id !== id));
      setSelectedSnippet((currentSnippet) => (currentSnippet?.id === id ? null : currentSnippet));
    } catch (deleteError) {
      setError(deleteError.message || "Could not delete snippet.");
    } finally {
      setActionId("");
    }
  }

  return (
    <div className="page-shell space-y-5">
      <div>
        <h2 className="text-2xl font-semibold text-slate-950">Snippets</h2>
        <p className="mt-1 text-sm text-slate-500">Review saved code and remove unwanted entries.</p>
      </div>

      {error ? <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div> : null}
      {selectedSnippet ? <PreviewPanel snippet={selectedSnippet} onClose={() => setSelectedSnippet(null)} /> : null}
      {isLoading ? <p className="text-sm text-slate-600">Loading snippets...</p> : null}

      {!isLoading ? (
        <DataTable
          columns={[
            { key: "title", header: "Title" },
            { key: "owner", header: "Owner", render: (row) => row.user?.email || "Unknown" },
            { key: "language", header: "Language" },
            { key: "mode", header: "Mode" },
            { key: "createdAt", header: "Created", render: (row) => formatDate(row.createdAt) },
            {
              key: "actions",
              header: "Actions",
              render: (row) => (
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleView(row.id)}
                    disabled={actionId === row.id}
                    className="focus-ring inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-300 text-slate-700 hover:bg-slate-50 disabled:opacity-60"
                    aria-label="View snippet"
                  >
                    <Eye className="h-4 w-4" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(row.id)}
                    disabled={actionId === row.id}
                    className="focus-ring inline-flex h-9 w-9 items-center justify-center rounded-md border border-red-200 text-red-700 hover:bg-red-50 disabled:opacity-60"
                    aria-label="Delete snippet"
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              ),
            },
          ]}
          rows={snippets}
        />
      ) : null}
    </div>
  );
}
