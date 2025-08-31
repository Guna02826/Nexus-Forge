import { useState, useRef, useEffect } from "react";
import API from "../api";

export default function CreateDocForm({ onCreated, onCancel }) {
  const [form, setForm] = useState({ title: "", content: "" });
  const [loading, setLoading] = useState(false);
  const titleInputRef = useRef(null);

  useEffect(() => {
    // Autofocus the title input on mount
    titleInputRef.current?.focus();
  }, []);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await API.post("/docs", form);
      setForm({ title: "", content: "" });
      onCreated(); // reload docs and close modal
    } catch (err) {
      console.error("Error creating doc", err);
      // Optionally add user feedback here
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setForm({ title: "", content: "" });
    if (onCancel) onCancel();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-6 rounded-lg shadow-md max-w-lg mx-auto"
      aria-label="Create new document form"
    >
      
      <label htmlFor="title" className="block mb-1 font-medium text-gray-700">
        Title
      </label>
      <input
        id="title"
        name="title"
        type="text"
        placeholder="Enter document title"
        value={form.title}
        onChange={handleChange}
        className="w-full border border-gray-300 p-3 rounded-md mb-4 focus:outline-none focus:ring-2 focus:ring-green-500"
        required
        disabled={loading}
        ref={titleInputRef}
        autoComplete="off"
      />
      <label
        htmlFor="content"
        className="block mb-1 font-medium text-gray-700"
      >
        Content
      </label>
      <textarea
        id="content"
        name="content"
        placeholder="Enter document content"
        value={form.content}
        onChange={handleChange}
        className="w-full border border-gray-300 p-3 rounded-md mb-4 focus:outline-none focus:ring-2 focus:ring-green-500 resize-y"
        rows={6}
        required
        disabled={loading}
      />
      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={handleCancel}
          className="bg-gray-400 text-white px-5 py-2 rounded-md hover:bg-gray-500 disabled:opacity-50 transition"
          disabled={loading}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="bg-green-600 text-white px-5 py-2 rounded-md hover:bg-green-700 disabled:opacity-50 transition"
          disabled={loading}
        >
          {loading ? "Saving..." : "Save"}
        </button>
      </div>
    </form>
  );
}
