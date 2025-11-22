import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

export default function Logout() {
  const navigate = useNavigate();

  useEffect(() => {
    const performLogout = async () => {
      try {
        const token = localStorage.getItem("token");
        if (token) {
          await api.post("/api/logout", {}, {
            headers: { Authorization: `Bearer ${token}` }
          });
        }
      } catch (err) {
        console.error("Error during logout:", err);
      } finally {
        // Clear local storage regardless of API success/failure
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        
        // Redirect to login page
        navigate("/login");
      }
    };

    performLogout();
  }, [navigate]);

  return (
    <div className="container text-center mt-5">
      <div className="spinner-border" role="status">
        <span className="visually-hidden">Logging out...</span>
      </div>
      <p className="mt-2">Logging out...</p>
    </div>
  );
}