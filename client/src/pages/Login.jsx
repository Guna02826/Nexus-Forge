import { useState } from "react";
import API from "../api";
import { useNavigate, Link } from "react-router";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await API.post("/auth/login", form);
      localStorage.setItem("token", res.data.token);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white px-4">
      <form
        onSubmit={handleSubmit}
        className="bg-gray-50 max-w-sm w-full p-8 rounded-lg shadow-md"
        aria-label="Login form"
        noValidate
      >
        <h2 className="text-2xl font-semibold mb-6 text-gray-900 text-center">
          Login
        </h2>
        {error && (
          <p
            className="mb-4 text-center text-sm text-red-600"
            role="alert"
            aria-live="assertive"
          >
            {error}
          </p>
        )}

        <label
          htmlFor="email"
          className="block mb-1 text-sm font-medium text-gray-700"
        >
          Email
        </label>
        <input
          id="email"
          type="email"
          name="email"
          placeholder="you@example.com"
          value={form.email}
          onChange={handleChange}
          className="w-full px-3 py-2 mb-4 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
          required
          disabled={loading}
          autoComplete="email"
        />

        <label
          htmlFor="password"
          className="block mb-1 text-sm font-medium text-gray-700"
        >
          Password
        </label>
        <input
          id="password"
          type="password"
          name="password"
          placeholder="••••••••"
          value={form.password}
          onChange={handleChange}
          className="w-full px-3 py-2 mb-6 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
          required
          disabled={loading}
          autoComplete="current-password"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 text-white bg-blue-600 rounded-md text-sm font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 disabled:opacity-50 transition"
          aria-busy={loading}
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>

      <p className="mt-4 text-sm text-gray-700">
        Don’t have an account?{" "}
        <Link
          to="/register"
          className="text-blue-600 hover:underline focus:outline-none focus:ring-1 focus:ring-blue-500 rounded"
        >
          Register
        </Link>
      </p>
    </div>
  );
}
