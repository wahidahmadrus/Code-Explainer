import { Check, Pencil, Plus, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";
import DataTable from "../components/DataTable.jsx";
import { createLanguage, deleteLanguage, getLanguages, updateLanguage } from "../services/adminApi.js";

function formatDate(value) {
  return value ? new Date(value).toLocaleDateString() : "Unknown";
}

export default function Languages() {
  const [languages, setLanguages] = useState([]);
  const [newName, setNewName] = useState("");
  const [newIsActive, setNewIsActive] = useState(true);
  const [editingId, setEditingId] = useState("");
  const [editingName, setEditingName] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [actionId, setActionId] = useState("");

  async function loadLanguages() {
    setError("");
    setIsLoading(true);

    try {
      setLanguages(await getLanguages());
    } catch (loadError) {
      setError(loadError.message || "Could not load languages.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadLanguages();
  }, []);

  async function handleCreate(event) {
    event.preventDefault();
    setError("");
    setActionId("new");

    try {
      const createdLanguage = await createLanguage({
        name: newName,
        isActive: newIsActive,
      });
      setLanguages((currentLanguages) =>
        [...currentLanguages, createdLanguage].sort((a, b) => a.name.localeCompare(b.name)),
      );
      setNewName("");
      setNewIsActive(true);
    } catch (createError) {
      setError(createError.message || "Could not add language.");
    } finally {
      setActionId("");
    }
  }

  function startEditing(language) {
    setEditingId(language.id);
    setEditingName(language.name);
  }

  function cancelEditing() {
    setEditingId("");
    setEditingName("");
  }

  async function handleSaveName(id) {
    setError("");
    setActionId(id);

    try {
      const updatedLanguage = await updateLanguage(id, { name: editingName });
      setLanguages((currentLanguages) =>
        currentLanguages
          .map((language) => (language.id === id ? updatedLanguage : language))
          .sort((a, b) => a.name.localeCompare(b.name)),
      );
      cancelEditing();
    } catch (updateError) {
      setError(updateError.message || "Could not update language.");
    } finally {
      setActionId("");
    }
  }

  async function handleToggle(language) {
    setError("");
    setActionId(language.id);

    try {
      const updatedLanguage = await updateLanguage(language.id, {
        isActive: !language.isActive,
      });
      setLanguages((currentLanguages) =>
        currentLanguages.map((item) => (item.id === language.id ? updatedLanguage : item)),
      );
    } catch (toggleError) {
      setError(toggleError.message || "Could not update language.");
    } finally {
      setActionId("");
    }
  }

  async function handleDelete(language) {
    const shouldDelete = window.confirm(`Delete ${language.name}?`);

    if (!shouldDelete) {
      return;
    }

    setError("");
    setActionId(language.id);

    try {
      await deleteLanguage(language.id);
      setLanguages((currentLanguages) => currentLanguages.filter((item) => item.id !== language.id));
    } catch (deleteError) {
      setError(deleteError.message || "Could not delete language.");
    } finally {
      setActionId("");
    }
  }

  return (
    <div className="page-shell space-y-5">
      <div>
        <h2 className="text-2xl font-semibold text-slate-950">Supported Languages</h2>
        <p className="mt-1 text-sm text-slate-500">Manage the language list for future app settings.</p>
      </div>

      {error ? <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div> : null}

      <form
        onSubmit={handleCreate}
        className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-end"
      >
        <label className="flex-1">
          <span className="text-sm font-medium text-slate-700">Language name</span>
          <input
            value={newName}
            onChange={(event) => setNewName(event.target.value)}
            className="focus-ring mt-1 block min-h-11 w-full rounded-md border border-slate-300 px-3 text-slate-950"
            placeholder="Python"
            required
          />
        </label>

        <label className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-slate-700">
          <input
            type="checkbox"
            checked={newIsActive}
            onChange={(event) => setNewIsActive(event.target.checked)}
            className="h-4 w-4 rounded border-slate-300 text-teal-700"
          />
          Active
        </label>

        <button
          type="submit"
          disabled={actionId === "new"}
          className="focus-ring inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-teal-700 px-4 text-sm font-semibold text-white hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-70"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add
        </button>
      </form>

      {isLoading ? <p className="text-sm text-slate-600">Loading languages...</p> : null}

      {!isLoading ? (
        <DataTable
          columns={[
            {
              key: "name",
              header: "Name",
              render: (row) =>
                editingId === row.id ? (
                  <input
                    value={editingName}
                    onChange={(event) => setEditingName(event.target.value)}
                    className="focus-ring min-h-10 w-full min-w-40 rounded-md border border-slate-300 px-2"
                  />
                ) : (
                  row.name
                ),
            },
            {
              key: "isActive",
              header: "Status",
              render: (row) => (
                <button
                  type="button"
                  onClick={() => handleToggle(row)}
                  disabled={actionId === row.id}
                  className={[
                    "focus-ring inline-flex min-h-9 items-center rounded-md px-3 text-sm font-medium disabled:opacity-60",
                    row.isActive ? "bg-teal-50 text-teal-800" : "bg-slate-100 text-slate-600",
                  ].join(" ")}
                >
                  {row.isActive ? "Active" : "Disabled"}
                </button>
              ),
            },
            { key: "createdAt", header: "Created", render: (row) => formatDate(row.createdAt) },
            {
              key: "actions",
              header: "Actions",
              render: (row) =>
                editingId === row.id ? (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleSaveName(row.id)}
                      disabled={actionId === row.id}
                      className="focus-ring inline-flex h-9 w-9 items-center justify-center rounded-md border border-teal-200 text-teal-700 hover:bg-teal-50 disabled:opacity-60"
                      aria-label="Save language"
                    >
                      <Check className="h-4 w-4" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={cancelEditing}
                      className="focus-ring inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-300 text-slate-700 hover:bg-slate-50"
                      aria-label="Cancel editing"
                    >
                      <X className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => startEditing(row)}
                      className="focus-ring inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-300 text-slate-700 hover:bg-slate-50"
                      aria-label="Edit language"
                    >
                      <Pencil className="h-4 w-4" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(row)}
                      disabled={actionId === row.id}
                      className="focus-ring inline-flex h-9 w-9 items-center justify-center rounded-md border border-red-200 text-red-700 hover:bg-red-50 disabled:opacity-60"
                      aria-label="Delete language"
                    >
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>
                ),
            },
          ]}
          rows={languages}
        />
      ) : null}
    </div>
  );
}
