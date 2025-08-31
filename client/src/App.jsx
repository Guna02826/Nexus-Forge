import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router"; // use react-router-dom for v6
import Login from "./pages/Login";
import Register from "./pages/Register"; // import your Register page
import Dashboard from "./pages/Dashboard";
import Search from "./pages/Search";
import QA from "./pages/QA";
import NotFound from "./pages/Notfound";
import ProtectedRoute from "./components/ProtectedRoute";
import Header from "./components/Header";

function AppLayout({ children }) {
  return (
    <>
      <Header />
      <main>{children}</main>
    </>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <AppLayout>
              <Login />
            </AppLayout>
          }
        />
        <Route
          path="/register"
          element={
            <AppLayout>
              <Register />
            </AppLayout>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <AppLayout>
                <Dashboard />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/search"
          element={
            <ProtectedRoute>
              <AppLayout>
                <Search />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/qa"
          element={
            <ProtectedRoute>
              <AppLayout>
                <QA />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}
