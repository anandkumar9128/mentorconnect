import React from "react";
import { Link } from "react-router-dom";
import { Sparkles, User as UserIcon } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import "../styles/Navbar.css";

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="navbar glass-panel">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <Sparkles
            className="logo-icon"
            style={{ color: "var(--primary-color)" }}
          />
          <span
            style={{
              color: "var(--primary-color)",
              fontFamily: "var(--font-serif)",
            }}
          >
            MentorConnect
          </span>
        </Link>
        <div style={{ marginLeft: '2rem', display: 'flex', gap: '1.5rem', flex: 1 }}>
          <Link to="/workshops" className="nav-link" style={{ fontWeight: '500', color: 'var(--text-color)', textDecoration: 'none' }}>Workshops</Link>
        </div>
        <div className="nav-buttons">
          {user ? (
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <Link
                to="/dashboard"
                className="btn-secondary"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  padding: "6px 16px",
                }}
              >
                <UserIcon size={18} /> Dashboard
              </Link>
              <button
                onClick={logout}
                className="btn-primary"
                style={{ padding: "6px 16px" }}
              >
                Log Out
              </button>
            </div>
          ) : (
            <>
              <Link to="/login" className="btn-secondary">
                Log In
              </Link>
              <Link to="/register" className="btn-primary">
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
