import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  // Hide navbar on auth pages
  const hideNavbar = ["/login", "/register"].includes(location.pathname);

  if (hideNavbar) {
    return null;
  }

  const isActive = (path: string) => {
    return (
      location.pathname === path || location.pathname.startsWith(path + "/")
    );
  };

  return (
    <div
      className="mac-window"
      style={{
        margin: "0 0 20px 0",
        borderRadius: 0,
        boxShadow: "0 2px 0 rgba(0, 0, 0, 0.3)",
      }}
    >
      {/* Title Bar */}
      <div className="mac-title-bar">
        <div style={{ display: "flex", gap: "4px" }}>
          <div
            style={{
              width: "12px",
              height: "12px",
              background: "#000",
              border: "1px solid #000",
            }}
          ></div>
          <div
            style={{
              width: "12px",
              height: "12px",
              background: "#fff",
              border: "1px solid #000",
            }}
          ></div>
        </div>
        <span
          style={{
            fontWeight: "bold",
            fontSize: "12px",
            flex: 1,
            textAlign: "center",
          }}
        >
          ROJUDGER - Competitive Programming Platform
        </span>
      </div>

      {/* Navigation Content */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "8px 16px",
          background: "var(--mac-bg)",
        }}
      >
        {/* Left Side - Logo & Navigation */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          {/* Logo */}
          <Link
            to="/"
            style={{
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <div
              style={{
                fontSize: "20px",
                filter: "grayscale(1)",
              }}
            >
              💻
            </div>
            <span
              style={{
                fontWeight: "bold",
                fontSize: "14px",
                color: "#000",
                letterSpacing: "1px",
              }}
            >
              ROJUDGER
            </span>
          </Link>

          {/* Navigation Links */}
          {isAuthenticated && (
            <div
              style={{
                display: "flex",
                gap: "4px",
                marginLeft: "8px",
              }}
            >
              <Link
                to="/problems"
                className="mac-button"
                style={{
                  padding: "4px 12px",
                  fontSize: "11px",
                  background: isActive("/problems")
                    ? "var(--mac-black)"
                    : "var(--mac-bg)",
                  color: isActive("/problems")
                    ? "var(--mac-light)"
                    : "var(--mac-black)",
                  textDecoration: "none",
                  display: "inline-block",
                }}
              >
                PROBLEMS
              </Link>
              <Link
                to="/leaderboard"
                className="mac-button"
                style={{
                  padding: "4px 12px",
                  fontSize: "11px",
                  background: isActive("/leaderboard")
                    ? "var(--mac-black)"
                    : "var(--mac-bg)",
                  color: isActive("/leaderboard")
                    ? "var(--mac-light)"
                    : "var(--mac-black)",
                  textDecoration: "none",
                  display: "inline-block",
                }}
              >
                LEADERBOARD
              </Link>
              <Link
                to="/submissions"
                className="mac-button"
                style={{
                  padding: "4px 12px",
                  fontSize: "11px",
                  background: isActive("/submissions")
                    ? "var(--mac-black)"
                    : "var(--mac-bg)",
                  color: isActive("/submissions")
                    ? "var(--mac-light)"
                    : "var(--mac-black)",
                  textDecoration: "none",
                  display: "inline-block",
                }}
              >
                SUBMISSIONS
              </Link>
              <Link
                to="/pvp"
                className="mac-button"
                style={{
                  padding: "4px 12px",
                  fontSize: "11px",
                  background: isActive("/pvp")
                    ? "var(--mac-black)"
                    : "var(--mac-bg)",
                  color: isActive("/pvp")
                    ? "var(--mac-light)"
                    : "var(--mac-black)",
                  textDecoration: "none",
                  display: "inline-block",
                }}
              >
                ⚔️ PVP
              </Link>
              <Link
                to="/pvp/public"
                className="mac-button"
                style={{
                  padding: "4px 12px",
                  fontSize: "11px",
                  background: isActive("/pvp/public")
                    ? "var(--mac-black)"
                    : "var(--mac-bg)",
                  color: isActive("/pvp/public")
                    ? "var(--mac-light)"
                    : "var(--mac-black)",
                  textDecoration: "none",
                  display: "inline-block",
                }}
              >
                🌐 PUBLIC
              </Link>
              <Link
                to="/pvp/my-sessions"
                className="mac-button"
                style={{
                  padding: "4px 12px",
                  fontSize: "11px",
                  background: isActive("/pvp/my-sessions")
                    ? "var(--mac-black)"
                    : "var(--mac-bg)",
                  color: isActive("/pvp/my-sessions")
                    ? "var(--mac-light)"
                    : "var(--mac-black)",
                  textDecoration: "none",
                  display: "inline-block",
                }}
              >
                📋 MY SESSIONS
              </Link>
            </div>
          )}
        </div>

        {/* Right Side - User Info / Auth Buttons */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {isAuthenticated ? (
            <>
              {/* User Profile Button */}
              <Link
                to={`/users/${user?.username}`}
                style={{
                  textDecoration: "none",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "4px 8px",
                  background: "var(--mac-light)",
                  border: "2px solid var(--mac-black)",
                  boxShadow: "inset 1px 1px 0 rgba(0, 0, 0, 0.1)",
                }}
              >
                <div
                  style={{
                    width: "20px",
                    height: "20px",
                    background: "#000",
                    border: "1px solid #000",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#fff",
                    fontSize: "10px",
                    fontWeight: "bold",
                  }}
                >
                  {user?.username?.charAt(0).toUpperCase()}
                </div>
                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: "bold",
                    color: "#000",
                  }}
                >
                  {user?.username}
                </span>
              </Link>

              {/* Logout Button */}
              <button onClick={handleLogout} className="mac-button">
                LOGOUT
              </button>
            </>
          ) : (
            <>
              <Link to="/login" style={{ textDecoration: "none" }}>
                <button className="mac-button">SIGN IN</button>
              </Link>
              <Link to="/register" style={{ textDecoration: "none" }}>
                <button className="mac-button-primary">SIGN UP</button>
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;
