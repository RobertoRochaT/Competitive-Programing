import React from "react";
import { Link } from "react-router-dom";

const LandingPage: React.FC = () => {
  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "20px" }}>
      {/* Main Hero Window */}
      <div className="mac-window" style={{ marginBottom: "20px" }}>
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
            Welcome to ROJUDGER
          </span>
        </div>

        <div style={{ padding: "32px", textAlign: "center" }}>
          {/* Icon */}
          <div
            style={{
              fontSize: "64px",
              marginBottom: "20px",
              filter: "grayscale(1)",
            }}
          >
            💻
          </div>

          {/* Heading */}
          <h1 style={{ margin: "0 0 16px 0", fontSize: "28px" }}>ROJUDGER</h1>
          <h2
            style={{
              margin: "0 0 24px 0",
              fontSize: "16px",
              fontWeight: "normal",
            }}
          >
            Competitive Programming Practice Platform
          </h2>

          {/* Description */}
          <div
            className="mac-inset"
            style={{
              margin: "0 auto 24px auto",
              maxWidth: "600px",
              padding: "16px",
            }}
          >
            <p style={{ margin: "0 0 12px 0", fontSize: "12px" }}>
              Your ultimate platform for competitive programming practice. Solve
              problems from LeetCode and Codeforces, track your progress, and
              compete with programmers worldwide.
            </p>
            <p style={{ margin: 0, fontSize: "12px", fontWeight: "bold" }}>
              System 7.0 Compatible • Free Forever
            </p>
          </div>

          {/* CTA Buttons */}
          <div
            style={{
              display: "flex",
              gap: "12px",
              justifyContent: "center",
              marginBottom: "24px",
            }}
          >
            <Link to="/register" style={{ textDecoration: "none" }}>
              <button
                className="mac-button-primary"
                style={{ fontSize: "12px", padding: "8px 24px" }}
              >
                CREATE ACCOUNT
              </button>
            </Link>
            <Link to="/login" style={{ textDecoration: "none" }}>
              <button
                className="mac-button"
                style={{ fontSize: "12px", padding: "8px 24px" }}
              >
                SIGN IN
              </button>
            </Link>
          </div>

          <div
            className="mac-divider"
            style={{ margin: "24px auto", maxWidth: "400px" }}
          ></div>

          {/* Quick Stats */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: "16px",
              maxWidth: "700px",
              margin: "0 auto",
            }}
          >
            <div className="mac-panel" style={{ padding: "12px" }}>
              <div style={{ fontSize: "20px", fontWeight: "bold" }}>1000+</div>
              <div style={{ fontSize: "10px", marginTop: "4px" }}>Problems</div>
            </div>
            <div className="mac-panel" style={{ padding: "12px" }}>
              <div style={{ fontSize: "20px", fontWeight: "bold" }}>5+</div>
              <div style={{ fontSize: "10px", marginTop: "4px" }}>
                Languages
              </div>
            </div>
            <div className="mac-panel" style={{ padding: "12px" }}>
              <div style={{ fontSize: "20px", fontWeight: "bold" }}>24/7</div>
              <div style={{ fontSize: "10px", marginTop: "4px" }}>
                Available
              </div>
            </div>
            <div className="mac-panel" style={{ padding: "12px" }}>
              <div style={{ fontSize: "20px", fontWeight: "bold" }}>FREE</div>
              <div style={{ fontSize: "10px", marginTop: "4px" }}>Forever</div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "16px",
          marginBottom: "20px",
        }}
      >
        {/* Feature 1 - Practice */}
        <div className="mac-window">
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
            </div>
            <span
              style={{
                fontWeight: "bold",
                fontSize: "12px",
                flex: 1,
                textAlign: "center",
              }}
            >
              Practice Problems
            </span>
          </div>
          <div style={{ padding: "20px", textAlign: "center" }}>
            <div
              style={{
                fontSize: "48px",
                marginBottom: "12px",
                filter: "grayscale(1)",
              }}
            >
              🎯
            </div>
            <h3 style={{ margin: "0 0 12px 0", fontSize: "14px" }}>
              Massive Problem Library
            </h3>
            <p style={{ margin: 0, fontSize: "11px", lineHeight: "1.6" }}>
              Access problems from LeetCode and Codeforces. Practice algorithms,
              data structures, and problem-solving techniques.
            </p>
          </div>
        </div>

        {/* Feature 2 - Track Progress */}
        <div className="mac-window">
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
            </div>
            <span
              style={{
                fontWeight: "bold",
                fontSize: "12px",
                flex: 1,
                textAlign: "center",
              }}
            >
              Track Your Progress
            </span>
          </div>
          <div style={{ padding: "20px", textAlign: "center" }}>
            <div
              style={{
                fontSize: "48px",
                marginBottom: "12px",
                filter: "grayscale(1)",
              }}
            >
              📊
            </div>
            <h3 style={{ margin: "0 0 12px 0", fontSize: "14px" }}>
              Detailed Statistics
            </h3>
            <p style={{ margin: 0, fontSize: "11px", lineHeight: "1.6" }}>
              Monitor performance with solve streaks, acceptance rates,
              difficulty breakdown, and language distribution.
            </p>
          </div>
        </div>

        {/* Feature 3 - Compete */}
        <div className="mac-window">
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
            </div>
            <span
              style={{
                fontWeight: "bold",
                fontSize: "12px",
                flex: 1,
                textAlign: "center",
              }}
            >
              Compete & Rank
            </span>
          </div>
          <div style={{ padding: "20px", textAlign: "center" }}>
            <div
              style={{
                fontSize: "48px",
                marginBottom: "12px",
                filter: "grayscale(1)",
              }}
            >
              🏆
            </div>
            <h3 style={{ margin: "0 0 12px 0", fontSize: "14px" }}>
              Global Leaderboard
            </h3>
            <p style={{ margin: 0, fontSize: "11px", lineHeight: "1.6" }}>
              Climb the ranks and compete with developers worldwide. Compare
              your stats and see where you stand.
            </p>
          </div>
        </div>
      </div>

      {/* How it Works Window */}
      <div className="mac-window" style={{ marginBottom: "20px" }}>
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
            Getting Started
          </span>
        </div>

        <div style={{ padding: "24px" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "20px",
            }}
          >
            <div className="mac-panel" style={{ padding: "16px" }}>
              <div
                style={{
                  background: "#000",
                  color: "#fff",
                  width: "24px",
                  height: "24px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: "bold",
                  fontSize: "14px",
                  marginBottom: "12px",
                  border: "2px solid #000",
                }}
              >
                1
              </div>
              <h4 style={{ margin: "0 0 8px 0", fontSize: "12px" }}>
                Create Account
              </h4>
              <p style={{ margin: 0, fontSize: "11px", lineHeight: "1.5" }}>
                Sign up for free and set up your profile
              </p>
            </div>

            <div className="mac-panel" style={{ padding: "16px" }}>
              <div
                style={{
                  background: "#000",
                  color: "#fff",
                  width: "24px",
                  height: "24px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: "bold",
                  fontSize: "14px",
                  marginBottom: "12px",
                  border: "2px solid #000",
                }}
              >
                2
              </div>
              <h4 style={{ margin: "0 0 8px 0", fontSize: "12px" }}>
                Choose Problems
              </h4>
              <p style={{ margin: 0, fontSize: "11px", lineHeight: "1.5" }}>
                Browse our library and pick problems to solve
              </p>
            </div>

            <div className="mac-panel" style={{ padding: "16px" }}>
              <div
                style={{
                  background: "#000",
                  color: "#fff",
                  width: "24px",
                  height: "24px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: "bold",
                  fontSize: "14px",
                  marginBottom: "12px",
                  border: "2px solid #000",
                }}
              >
                3
              </div>
              <h4 style={{ margin: "0 0 8px 0", fontSize: "12px" }}>
                Code & Submit
              </h4>
              <p style={{ margin: 0, fontSize: "11px", lineHeight: "1.5" }}>
                Write your solution and submit for instant testing
              </p>
            </div>

            <div className="mac-panel" style={{ padding: "16px" }}>
              <div
                style={{
                  background: "#000",
                  color: "#fff",
                  width: "24px",
                  height: "24px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: "bold",
                  fontSize: "14px",
                  marginBottom: "12px",
                  border: "2px solid #000",
                }}
              >
                4
              </div>
              <h4 style={{ margin: "0 0 8px 0", fontSize: "12px" }}>
                Track Progress
              </h4>
              <p style={{ margin: 0, fontSize: "11px", lineHeight: "1.5" }}>
                Monitor your stats and climb the leaderboard
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Final CTA Window */}
      <div className="mac-window">
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
            Ready to Start?
          </span>
        </div>

        <div style={{ padding: "32px", textAlign: "center" }}>
          <h2 style={{ margin: "0 0 12px 0", fontSize: "18px" }}>
            Join the Community Today
          </h2>
          <p
            style={{
              fontSize: "12px",
              maxWidth: "500px",
              margin: "0 auto 24px auto",
            }}
          >
            Start improving your competitive programming skills now. No credit
            card required. Free forever.
          </p>

          <div
            style={{ display: "flex", gap: "12px", justifyContent: "center" }}
          >
            <Link to="/register" style={{ textDecoration: "none" }}>
              <button
                className="mac-button-primary"
                style={{ fontSize: "12px", padding: "8px 32px" }}
              >
                GET STARTED →
              </button>
            </Link>
            <Link to="/problems" style={{ textDecoration: "none" }}>
              <button
                className="mac-button"
                style={{ fontSize: "12px", padding: "8px 32px" }}
              >
                BROWSE PROBLEMS
              </button>
            </Link>
          </div>

          <div
            className="mac-divider"
            style={{ margin: "24px auto", maxWidth: "400px" }}
          ></div>

          {/* Footer Links */}
          <div
            style={{
              fontSize: "10px",
              display: "flex",
              gap: "16px",
              justifyContent: "center",
            }}
          >
            <a href="#" style={{ color: "#000", textDecoration: "underline" }}>
              About
            </a>
            <a href="#" style={{ color: "#000", textDecoration: "underline" }}>
              GitHub
            </a>
            <a href="#" style={{ color: "#000", textDecoration: "underline" }}>
              Documentation
            </a>
            <a href="#" style={{ color: "#000", textDecoration: "underline" }}>
              Contact
            </a>
          </div>

          <p
            style={{ margin: "12px 0 0 0", fontSize: "10px", color: "#606060" }}
          >
            © 2026 ROJUDGER • Built for competitive programmers
          </p>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
