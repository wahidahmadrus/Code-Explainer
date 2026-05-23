import { Eye, X } from "lucide-react";
import { useEffect, useState } from "react";
import DataTable from "../components/DataTable.jsx";
import { getAiRequests } from "../services/adminApi.js";

function formatDate(value) {
  return value ? new Date(value).toLocaleString() : "Unknown";
}

function DetailPanel({ request, onClose }) {
  if (!request) {
    return null;
  }

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-950">
            {request.requestType} · {request.language}
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            {request.user?.email || "Anonymous"} · {formatDate(request.createdAt)}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="focus-ring inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-300 text-slate-600 hover:bg-slate-50"
          aria-label="Close request details"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-2">
        <div>
          <h4 className="text-sm font-semibold text-slate-700">Input</h4>
          <pre className="mt-2 max-h-96 overflow-auto whitespace-pre-wrap rounded-md bg-slate-100 p-4 text-sm text-slate-800">
            {request.inputText}
          </pre>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-slate-700">Output</h4>
          <pre className="mt-2 max-h-96 overflow-auto rounded-md bg-slate-950 p-4 text-sm text-slate-50">
            <code>{JSON.stringify(request.outputText, null, 2)}</code>
          </pre>
        </div>
      </div>
    </section>
  );
}

export default function AiRequests() {
  const [requests, setRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadRequests() {
      try {
        const data = await getAiRequests();

        if (isMounted) {
          setRequests(data);
        }
      } catch (loadError) {
        if (isMounted) {
          setError(loadError.message || "Could not load AI requests.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadRequests();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="page-shell space-y-5">
      <div>
        <h2 className="text-2xl font-semibold text-slate-950">AI Requests</h2>
        <p className="mt-1 text-sm text-slate-500">Inspect recent explain and generate requests.</p>
      </div>

      {error ? <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div> : null}
      {selectedRequest ? <DetailPanel request={selectedRequest} onClose={() => setSelectedRequest(null)} /> : null}
      {isLoading ? <p className="text-sm text-slate-600">Loading AI requests...</p> : null}

      {!isLoading ? (
        <DataTable
          columns={[
            { key: "requestType", header: "Type" },
            { key: "language", header: "Language" },
            { key: "user", header: "User", render: (row) => row.user?.email || "Anonymous" },
            { key: "createdAt", header: "Created", render: (row) => formatDate(row.createdAt) },
            {
              key: "actions",
              header: "Actions",
              render: (row) => (
                <button
                  type="button"
                  onClick={() => setSelectedRequest(row)}
                  className="focus-ring inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-300 text-slate-700 hover:bg-slate-50"
                  aria-label="View AI request"
                >
                  <Eye className="h-4 w-4" aria-hidden="true" />
                </button>
              ),
            },
          ]}
          rows={requests}
        />
      ) : null}
    </div>
  );
}
