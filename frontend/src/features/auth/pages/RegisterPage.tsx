import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    fullName: "",
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

  const validateForm = (): string | null => {
    if (formData.username.length < 3) {
      return "Username must be at least 3 characters long";
    }
    if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      return "Username can only contain letters, numbers, and underscores";
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      return "Please enter a valid email address";
    }
    if (formData.password.length < 6) {
      return "Password must be at least 6 characters long";
    }
    if (formData.password !== formData.confirmPassword) {
      return "Passwords do not match";
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);

    try {
      await register({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        fullName: formData.fullName || undefined,
      });
      navigate("/");
    } catch (err: any) {
      setError(err.message || "Registration failed. Please try again.");
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
      <div className="mac-window" style={{ maxWidth: "500px", width: "100%" }}>
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
            Create New Account
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
              👤
            </div>
            <h2 style={{ margin: "0 0 8px 0", fontSize: "16px" }}>
              Create your account
            </h2>
            <p style={{ fontSize: "11px", margin: 0, color: "#404040" }}>
              Join the coding community today
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

          {/* Registration Form */}
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: "14px" }}>
              <label
                htmlFor="username"
                style={{
                  display: "block",
                  marginBottom: "6px",
                  fontWeight: "bold",
                  fontSize: "11px",
                }}
              >
                Username: *
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                className="mac-input"
                placeholder="Choose a username"
                value={formData.username}
                onChange={handleChange}
                style={{ width: "100%", fontSize: "12px" }}
                disabled={isLoading}
              />
              <div
                style={{ fontSize: "10px", color: "#606060", marginTop: "4px" }}
              >
                Letters, numbers, and underscores only (min. 3 chars)
              </div>
            </div>

            <div style={{ marginBottom: "14px" }}>
              <label
                htmlFor="email"
                style={{
                  display: "block",
                  marginBottom: "6px",
                  fontWeight: "bold",
                  fontSize: "11px",
                }}
              >
                Email: *
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="mac-input"
                placeholder="your.email@example.com"
                value={formData.email}
                onChange={handleChange}
                style={{ width: "100%", fontSize: "12px" }}
                disabled={isLoading}
              />
            </div>

            <div style={{ marginBottom: "14px" }}>
              <label
                htmlFor="fullName"
                style={{
                  display: "block",
                  marginBottom: "6px",
                  fontWeight: "bold",
                  fontSize: "11px",
                }}
              >
                Full Name:
              </label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                className="mac-input"
                placeholder="John Doe (optional)"
                value={formData.fullName}
                onChange={handleChange}
                style={{ width: "100%", fontSize: "12px" }}
                disabled={isLoading}
              />
            </div>

            <div style={{ marginBottom: "14px" }}>
              <label
                htmlFor="password"
                style={{
                  display: "block",
                  marginBottom: "6px",
                  fontWeight: "bold",
                  fontSize: "11px",
                }}
              >
                Password: *
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
              <div
                style={{ fontSize: "10px", color: "#606060", marginTop: "4px" }}
              >
                Minimum 6 characters
              </div>
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label
                htmlFor="confirmPassword"
                style={{
                  display: "block",
                  marginBottom: "6px",
                  fontWeight: "bold",
                  fontSize: "11px",
                }}
              >
                Confirm Password: *
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                className="mac-input"
                placeholder="Re-enter password"
                value={formData.confirmPassword}
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
                  minWidth: "140px",
                  opacity: isLoading ? 0.6 : 1,
                  cursor: isLoading ? "not-allowed" : "pointer",
                }}
              >
                {isLoading ? "Creating..." : "Create Account"}
              </button>
              <Link to="/" style={{ textDecoration: "none" }}>
                <button type="button" className="mac-button">
                  Cancel
                </button>
              </Link>
            </div>
          </form>

          <div className="mac-divider" style={{ margin: "20px 0" }}></div>

          {/* Login Link */}
          <div
            style={{
              textAlign: "center",
              fontSize: "11px",
              padding: "12px",
              background: "var(--mac-bg)",
              border: "1px solid #808080",
            }}
          >
            <span style={{ marginRight: "8px" }}>Already have an account?</span>
            <Link
              to="/login"
              style={{
                color: "#000",
                fontWeight: "bold",
                textDecoration: "underline",
              }}
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
