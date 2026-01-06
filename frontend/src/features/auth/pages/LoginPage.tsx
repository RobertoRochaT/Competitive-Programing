import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    usernameOrEmail: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await login(formData);
      navigate("/");
    } catch (err: any) {
      setError(err.message || "Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}
    >
      <div className="mac-window" style={{ maxWidth: "450px", width: "100%" }}>
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
            Sign In
          </span>
        </div>

        {/* Window Content */}
        <div style={{ padding: "24px" }}>
          {/* Header with Icon */}
          <div style={{ textAlign: "center", marginBottom: "24px" }}>
            <div
              style={{
                fontSize: "48px",
                marginBottom: "12px",
                filter: "grayscale(1)",
              }}
            >
              🔐
            </div>
            <h2 style={{ margin: "0 0 8px 0", fontSize: "16px" }}>
              Sign in to your account
            </h2>
            <p style={{ fontSize: "11px", margin: 0, color: "#404040" }}>
              Enter your credentials to continue
            </p>
          </div>

          <div className="mac-divider" style={{ margin: "16px 0" }}></div>

          {/* Error Alert */}
          {error && (
            <div
              className="mac-panel"
              style={{
                padding: "12px",
                marginBottom: "16px",
                background: "#fff",
                border: "2px solid #000",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "8px",
                }}
              >
                <span style={{ fontSize: "16px" }}>⚠️</span>
                <div>
                  <div
                    style={{
                      fontWeight: "bold",
                      fontSize: "11px",
                      marginBottom: "4px",
                    }}
                  >
                    Error
                  </div>
                  <div style={{ fontSize: "11px" }}>{error}</div>
                </div>
              </div>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: "16px" }}>
              <label
                htmlFor="usernameOrEmail"
                style={{
                  display: "block",
                  marginBottom: "6px",
                  fontWeight: "bold",
                  fontSize: "11px",
                }}
              >
                Username or Email:
              </label>
              <input
                id="usernameOrEmail"
                name="usernameOrEmail"
                type="text"
                required
                className="mac-input"
                placeholder="Enter username or email"
                value={formData.usernameOrEmail}
                onChange={handleChange}
                style={{ width: "100%", fontSize: "12px" }}
                disabled={isLoading}
              />
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label
                htmlFor="password"
                style={{
                  display: "block",
                  marginBottom: "6px",
                  fontWeight: "bold",
                  fontSize: "11px",
                }}
              >
                Password:
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="mac-input"
                placeholder="Enter password"
                value={formData.password}
                onChange={handleChange}
                style={{ width: "100%", fontSize: "12px" }}
                disabled={isLoading}
              />
            </div>

            <div className="mac-divider" style={{ margin: "20px 0" }}></div>

            {/* Action Buttons */}
            <div
              style={{
                display: "flex",
                gap: "12px",
                justifyContent: "center",
              }}
            >
              <button
                type="submit"
                className="mac-button-primary"
                disabled={isLoading}
                style={{
                  minWidth: "120px",
                  opacity: isLoading ? 0.6 : 1,
                  cursor: isLoading ? "not-allowed" : "pointer",
                }}
              >
                {isLoading ? "Signing in..." : "Sign In"}
              </button>
              <Link to="/" style={{ textDecoration: "none" }}>
                <button type="button" className="mac-button">
                  Cancel
                </button>
              </Link>
            </div>
          </form>

          <div className="mac-divider" style={{ margin: "20px 0" }}></div>

          {/* Register Link */}
          <div
            style={{
              textAlign: "center",
              fontSize: "11px",
              padding: "12px",
              background: "var(--mac-bg)",
              border: "1px solid #808080",
            }}
          >
            <span style={{ marginRight: "8px" }}>Don't have an account?</span>
            <Link
              to="/register"
              style={{
                color: "#000",
                fontWeight: "bold",
                textDecoration: "underline",
              }}
            >
              Create Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
