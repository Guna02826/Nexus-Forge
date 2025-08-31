import Navbar from "../components/Navbar";
import { useState } from "react";
import API from "../api";

export default function QA() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [contextDocs, setContextDocs] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleAsk = async (e) => {
    e.preventDefault();
    setLoading(true);
    setAnswer("");
    setContextDocs([]);
    try {
      const res = await API.post("/docs/qa", { question });
      setAnswer(res.data.answer);
      if (res.data.contextDocs) {
        setContextDocs(res.data.contextDocs);
      }
    } catch (err) {
      console.error("Q&A error:", err);
      setAnswer("Failed to fetch answer.");
    }
    setLoading(false);
  };

  return (
    <>
      <Navbar />
      <main className="max-w-4xl mx-auto p-6 space-y-6">
        <h1 className="text-3xl font-semibold text-gray-900">Ask a Question</h1>

        {/* Question Form */}
        <form
          onSubmit={handleAsk}
          className="flex flex-col sm:flex-row gap-3 bg-white p-4 rounded-md shadow-sm"
          aria-label="Question form"
        >
          <label htmlFor="question" className="sr-only">
            Your question
          </label>
          <input
            id="question"
            type="text"
            placeholder="Type your question..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            className="flex-grow border border-gray-300 rounded-md px-4 py-2 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
            required
            disabled={loading}
            autoComplete="off"
            aria-required="true"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-green-600 text-white px-5 py-2 rounded-md font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-60 transition"
            aria-busy={loading}
          >
            Ask
          </button>
        </form>

        {/* Loading */}
        {loading && (
          <p className="text-center text-gray-500 italic" role="status" aria-live="polite">
            Thinking...
          </p>
        )}

        {/* Answer */}
        {answer && (
          <section
            className="bg-white p-5 rounded-md shadow-sm"
            aria-live="polite"
            aria-label="Answer"
          >
            <h2 className="text-xl font-semibold mb-3 text-gray-900">Answer</h2>
            <p className="text-gray-800 whitespace-pre-line">{answer}</p>
          </section>
        )}

        {/* Context Docs */}
        {contextDocs.length > 0 && (
          <section className="space-y-4" aria-label="Context Documents">
            <h2 className="text-xl font-semibold text-gray-900">Context Documents</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {contextDocs.map((doc) => (
                <article
                  key={doc._id}
                  className="bg-white p-4 rounded-md shadow-sm flex flex-col"
                >
                  <h3 className="text-lg font-bold text-gray-900 mb-1">{doc.title}</h3>
                  <p className="text-gray-600 mb-3 line-clamp-3">{doc.summary}</p>
                  <div className="flex flex-wrap gap-2 mt-auto">
                    {doc.tags?.map((tag, i) => (
                      <span
                        key={i}
                        className="inline-block text-xs font-medium bg-blue-100 text-blue-700 px-2 py-1 rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}
      </main>
    </>
  );
}
