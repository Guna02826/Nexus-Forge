import Navbar from "../components/Navbar";
import { useState } from "react";
import API from "../api";

export default function Search() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [message, setMessage] = useState("");
  const [mode, setMode] = useState("regular"); // "regular" or "semantic"
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let res;
      if (mode === "regular") {
        res = await API.get(`/docs/search?q=${encodeURIComponent(query)}`);
        if (Array.isArray(res.data)) {
          setResults(res.data);
          setMessage("");
        } else {
          setResults(res.data.docs ?? []);
          setMessage(res.data.message ?? "");
        }
      } else {
        res = await API.post("/docs/semantic-search", { query });
        setResults(res.data.docs ?? res.data ?? []);
        setMessage(res.data.message ?? "");
      }
    } catch (err) {
      console.error("Search error:", err);
      setResults([]);
      setMessage("An error occurred during search.");
    }
    setLoading(false);
  };

  return (
    <>
      <Navbar />
      <main className="max-w-4xl mx-auto p-6 space-y-6">
        <h1 className="text-3xl font-semibold text-gray-900">Search Documents</h1>

        {/* Search Form */}
        <form
          onSubmit={handleSearch}
          className="flex flex-col sm:flex-row gap-3 bg-white p-4 rounded-md shadow-sm"
          aria-label="Search documents form"
        >
          <label htmlFor="search-query" className="sr-only">
            Search query
          </label>
          <input
            id="search-query"
            type="text"
            placeholder="Enter your search query..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-grow border border-gray-300 rounded-md px-4 py-2 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            required
            disabled={loading}
            autoComplete="off"
            aria-required="true"
          />

          <label htmlFor="search-mode" className="sr-only">
            Search mode
          </label>
          <select
            id="search-mode"
            value={mode}
            onChange={(e) => setMode(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            disabled={loading}
          >
            <option value="regular">Regular</option>
            <option value="semantic">Semantic</option>
          </select>

          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-5 py-2 rounded-md font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60 transition"
            aria-busy={loading}
          >
            Search
          </button>
        </form>

        {/* Loading */}
        {loading && (
          <p
            className="text-center text-gray-500 italic"
            role="status"
            aria-live="polite"
          >
            Loading results...
          </p>
        )}

        {/* Results */}
        <section aria-live="polite" aria-label="Search results">
          {results.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {results.map((doc) => (
                <article
                  key={doc._id}
                  className="bg-white p-5 rounded-md shadow-sm flex flex-col"
                >
                  <h3 className="font-bold text-lg text-gray-900 mb-1">
                    {doc.title}
                  </h3>
                  <p className="text-gray-600 mb-3 line-clamp-3">{doc.summary}</p>
                  <div className="flex flex-wrap gap-2 mb-2 mt-auto">
                    {doc.tags?.map((tag, i) => (
                      <span
                        key={i}
                        className="inline-block text-xs font-medium bg-blue-100 text-blue-700 px-2 py-1 rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  {doc.score && (
                    <p className="text-sm text-gray-500">
                      Relevance: {doc.score.toFixed(2)}
                    </p>
                  )}
                </article>
              ))}
            </div>
          ) : (
            !loading && (
              <p className="text-center text-gray-600 italic mt-8">
                {message || "No documents found"}
              </p>
            )
          )}
        </section>
      </main>
    </>
  );
}
