import { jwtDecode } from "jwt-decode";


export function getCurrentUser() {
  const token = localStorage.getItem("token");
  if (!token) return null;

  try {
    const decoded = jwtDecode(token);
    return {
      userId: decoded.id,
      role: decoded.role,
    };
  } catch (e) {
    console.error("Invalid token:", e);
    return null;
  }
}
