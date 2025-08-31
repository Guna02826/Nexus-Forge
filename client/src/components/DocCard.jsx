import { useState } from "react";
import API from "../api";
import { getCurrentUser } from "../utils/auth";

export default function DocCard({ doc, onUpdated }) {
  const currentUser = getCurrentUser();
  const userId = currentUser?.userId;
  const role = currentUser?.role;

  const isOwner = doc.createdBy?._id === userId;
  const isAdmin = role === "admin";
  const canEdit = isOwner || isAdmin;

  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({ title: doc.title, content: doc.content });

  // Separate loading states
  const [loadingSave, setLoadingSave] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState(false);
  const [loadingSummarize, setLoadingSummarize] = useState(false);
  const [loadingGenerateTags, setLoadingGenerateTags] = useState(false);

  const handleDelete = async () => {
    if (!window.confirm("Delete this document?")) return;
    setLoadingDelete(true);
    try {
      await API.delete(`/docs/${doc._id}`);
      onUpdated();
    } catch (err) {
      console.error("Delete error:", err);
    } finally {
      setLoadingDelete(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoadingSave(true);
    try {
      await API.put(`/docs/${doc._id}`, form);
      setIsEditing(false);
      onUpdated();
    } catch (err) {
      console.error("Update error:", err);
    } finally {
      setLoadingSave(false);
    }
  };

  const handleSummarize = async () => {
    setLoadingSummarize(true);
    try {
      await API.post(`/docs/${doc._id}/summarize`);
      onUpdated();
    } catch (err) {
      console.error("Summarize error:", err);
    } finally {
      setLoadingSummarize(false);
    }
  };

  const handleGenerateTags = async () => {
    setLoadingGenerateTags(true);
    try {
      await API.post(`/docs/${doc._id}/tags`);
      onUpdated();
    } catch (err) {
      console.error("Generate tags error:", err);
    } finally {
      setLoadingGenerateTags(false);
    }
  };

  return (
    <article className="bg-white p-5 rounded-lg shadow-md space-y-4 transition-shadow hover:shadow-lg">
      {isEditing ? (
        <form onSubmit={handleUpdate} className="space-y-4">
          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loadingSave}
            aria-label="Document title"
          />
          <textarea
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
            className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
            rows={5}
            disabled={loadingSave}
            aria-label="Document content"
          />
          <div className="flex gap-3 justify-end">
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50 transition"
              disabled={loadingSave}
            >
              {loadingSave ? "Saving..." : "Save"}
            </button>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400 disabled:opacity-50 transition"
              disabled={loadingSave}
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <>
          <h3
            className="text-lg font-semibold text-gray-900 truncate"
            title={doc.title}
          >
            {doc.title}
          </h3>
          <p className="text-gray-600 line-clamp-3">
            {doc.summary || doc.content}
          </p>

          <div className="flex flex-wrap gap-2">
            {doc.tags?.map((tag, i) => (
              <span
                key={i}
                className="text-xs font-medium bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full select-none"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Metadata */}
          <dl className="text-sm text-gray-500 grid grid-cols-2 gap-x-4 gap-y-1">
            <div>
              <dt className="font-medium text-gray-700">Author:</dt>
              <dd>{doc.createdBy?.name || "Unknown"}</dd>
            </div>
            <div>
              <dt className="font-medium text-gray-700">Created:</dt>
              <dd>{new Date(doc.createdAt).toLocaleDateString()}</dd>
            </div>
            <div>
              <dt className="font-medium text-gray-700">Updated:</dt>
              <dd>{new Date(doc.updatedAt).toLocaleDateString()}</dd>
            </div>
            <div>
              <dt className="font-medium text-gray-700">Version:</dt>
              <dd>{doc.__v}</dd>
            </div>
          </dl>

          {/* Actions */}
          {canEdit && (
            <div className="flex flex-wrap gap-4 mt-3 text-sm">
              <button
                onClick={() => setIsEditing(true)}
                className="text-blue-600 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-400 rounded"
                disabled={loadingSave}
                aria-label={`Edit document titled ${doc.title}`}
              >
                Edit
              </button>
              <button
                onClick={handleDelete}
                className="text-red-600 hover:underline focus:outline-none focus:ring-2 focus:ring-red-400 rounded"
                disabled={loadingDelete}
                aria-label={`Delete document titled ${doc.title}`}
              >
                {loadingDelete ? "Deleting..." : "Delete"}
              </button>
              <button
                onClick={handleSummarize}
                className="text-green-600 hover:underline focus:outline-none focus:ring-2 focus:ring-green-400 rounded"
                disabled={loadingSummarize}
                aria-label={`Summarize document titled ${doc.title}`}
              >
                {loadingSummarize ? "Summarizing..." : "Summarize"}
              </button>
              <button
                onClick={handleGenerateTags}
                className="text-purple-600 hover:underline focus:outline-none focus:ring-2 focus:ring-purple-400 rounded"
                disabled={loadingGenerateTags}
                aria-label={`Generate tags for document titled ${doc.title}`}
              >
                {loadingGenerateTags ? "Generating..." : "Generate Tags"}
              </button>
            </div>
          )}
        </>
      )}
    </article>
  );
}
