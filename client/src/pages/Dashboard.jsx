import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import DocCard from "../components/DocCard";
import CreateDocForm from "../components/CreateDocForm";
import ActivityFeed from "../components/ActivityFeed";
import { getCurrentUser } from "../utils/auth";
import API from "../api";

export default function Dashboard() {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [activeTag, setActiveTag] = useState(null);

  const allTags = [...new Set(docs.flatMap((d) => d.tags || []))];
  const filteredDocs = activeTag ? docs.filter((d) => d.tags?.includes(activeTag)) : docs;

  useEffect(() => {
    loadDocs();
  }, []);

  const loadDocs = async () => {
    setLoading(true);
    try {
      const res = await API.get("/docs");
      setDocs(res.data);
    } catch (err) {
      console.error("Error loading docs", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />

      <div className="relative min-h-screen bg-white">
        {/* Modal */}
        {showCreateForm && (
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            tabIndex={-1}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30"
            onClick={() => setShowCreateForm(false)}
            onKeyDown={(e) => e.key === "Escape" && setShowCreateForm(false)}
          >
            <div
              className="bg-white rounded-md max-w-md w-full p-6 shadow-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 id="modal-title" className="text-lg font-semibold mb-4 text-gray-900">
                Create New Document
              </h2>
              <CreateDocForm
                onCreated={() => {
                  loadDocs();
                  setShowCreateForm(false);
                }}
                onCancel={() => setShowCreateForm(false)}
              />
            </div>
          </div>
        )}

        {/* Main Content */}
        <main
          className={`max-w-6xl mx-auto p-4 sm:p-6 transition-filter duration-200 ${
            showCreateForm ? "filter blur-sm pointer-events-none select-none" : ""
          }`}
        >
          <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-3">
            <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>

            <button
              onClick={() => setShowCreateForm(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              type="button"
            >
              + Add Document
            </button>
          </header>

          {/* Tags Filter */}
          <section aria-label="Filter documents by tags" className="mb-8">
            <div className="flex flex-wrap gap-2">
              <TagButton active={!activeTag} onClick={() => setActiveTag(null)} label="All" />
              {allTags.map((tag) => (
                <TagButton
                  key={tag}
                  active={activeTag === tag}
                  onClick={() => setActiveTag(tag)}
                  label={tag}
                />
              ))}
            </div>
          </section>

          {/* Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-8">
            {/* Documents */}
            <section aria-live="polite" aria-busy={loading}>
              {loading ? (
                <p className="text-gray-600">Loading documents...</p>
              ) : filteredDocs.length === 0 ? (
                <p className="text-gray-600">No documents found.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {filteredDocs.map((doc) => (
                    <DocCard key={doc._id} doc={doc} onUpdated={loadDocs} />
                  ))}
                </div>
              )}
            </section>

            {/* Activity Feed */}
            <aside className="sticky top-6 bg-white rounded-md border border-gray-200 p-4 max-h-[75vh] overflow-auto">
              <h2 className="text-lg font-semibold mb-3 text-gray-900">Recent Activity</h2>
              <ActivityFeed id={getCurrentUser().userId} />
            </aside>
          </div>
        </main>
      </div>
    </>
  );
}

function TagButton({ active, onClick, label }) {
  return (
    <button
      onClick={onClick}
      type="button"
      className={`px-3 py-1 rounded-md text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-blue-500 ${
        active
          ? "bg-blue-600 text-white"
          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
      }`}
      aria-pressed={active}
    >
      {label}
    </button>
  );
}
