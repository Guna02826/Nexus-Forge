import { Link, useNavigate } from "react-router";

export default function Navbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <nav className="bg-gray-900 text-white p-4 flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-0">
      <div className="flex gap-6 text-sm sm:text-base">
        <Link to="/dashboard" className="hover:text-gray-300 transition">
          Dashboard
        </Link>
        <Link to="/search" className="hover:text-gray-300 transition">
          Search
        </Link>
        <Link to="/qa" className="hover:text-gray-300 transition">
          Team Q&A
        </Link>
      </div>

      <button
        onClick={handleLogout}
        className="bg-red-600 px-4 py-1 rounded-md hover:bg-red-700 transition focus:outline-none focus:ring-2 focus:ring-red-400"
        aria-label="Logout"
      >
        Logout
      </button>
    </nav>
  );
}
