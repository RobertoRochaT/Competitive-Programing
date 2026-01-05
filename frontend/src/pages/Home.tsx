import React from "react";
import { useNavigate, Link } from "react-router-dom";

const Home: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "20px" }}>
      {/* Welcome Window */}
      <div className="mac-window">
        <div className="mac-title-bar">
          <div
            style={{
              display: "flex",
              gap: "4px",
            }}
          >
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
            Welcome to Code Practice System
          </span>
        </div>

        <div style={{ padding: "24px" }}>
          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: "24px" }}>
            <div
              style={{
                fontSize: "48px",
                marginBottom: "16px",
                filter: "grayscale(1)",
              }}
            >
              💻
            </div>
            <h1 style={{ marginBottom: "12px" }}>Welcome Back, User!</h1>
            <p
              style={{
                fontSize: "12px",
                margin: "0 auto",
                maxWidth: "600px",
              }}
            >
              Ready to sharpen your programming skills? Test yourself against
              our library of challenges or start a competitive match.
            </p>
          </div>

          <div className="mac-divider"></div>

          {/* Main Actions */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "16px",
              marginBottom: "24px",
            }}
          >
            {/* Practice Problems Card */}
            <div
              className="mac-panel"
              style={{
                padding: "16px",
                cursor: "pointer",
                position: "relative",
              }}
              onClick={() => navigate("/problems")}
            >
              <div
                style={{
                  fontSize: "32px",
                  marginBottom: "8px",
                  filter: "grayscale(1)",
                }}
              >
                📚
              </div>
              <h3 style={{ marginBottom: "8px" }}>Practice Problems</h3>
              <p style={{ fontSize: "11px", margin: 0 }}>
                Browse and solve coding challenges to improve your skills
              </p>
              <div
                style={{
                  marginTop: "12px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div className="mac-inset" style={{ padding: "4px 8px" }}>
                  <span style={{ fontSize: "10px", fontWeight: "bold" }}>
                    10 PROBLEMS
                  </span>
                </div>
                <span style={{ fontSize: "18px" }}>→</span>
              </div>
            </div>

            {/* Create Match Card */}
            <div
              className="mac-panel"
              style={{
                padding: "16px",
                cursor: "pointer",
                position: "relative",
              }}
              onClick={() => navigate("/match/create")}
            >
              <div
                style={{
                  fontSize: "32px",
                  marginBottom: "8px",
                  filter: "grayscale(1)",
                }}
              >
                ⚔️
              </div>
              <h3 style={{ marginBottom: "8px" }}>Start New Match</h3>
              <p style={{ fontSize: "11px", margin: 0 }}>
                Challenge another programmer to a timed coding duel
              </p>
              <div
                style={{
                  marginTop: "12px",
                }}
              >
                <button
                  className="mac-button-primary"
                  style={{ width: "100%" }}
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate("/match/create");
                  }}
                >
                  Create Match
                </button>
              </div>
            </div>

            {/* Join Match Card */}
            <div
              className="mac-panel"
              style={{
                padding: "16px",
                cursor: "pointer",
                position: "relative",
              }}
              onClick={() => navigate("/match/join")}
            >
              <div
                style={{
                  fontSize: "32px",
                  marginBottom: "8px",
                  filter: "grayscale(1)",
                }}
              >
                🎯
              </div>
              <h3 style={{ marginBottom: "8px" }}>Join a Match</h3>
              <p style={{ fontSize: "11px", margin: 0 }}>
                Enter a match code and compete against another coder
              </p>
              <div
                style={{
                  marginTop: "12px",
                }}
              >
                <button
                  className="mac-button"
                  style={{ width: "100%" }}
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate("/match/join");
                  }}
                >
                  Join Match
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Window */}
      <div className="mac-window" style={{ marginTop: "20px" }}>
        <div className="mac-title-bar">
          <div
            style={{
              width: "12px",
              height: "12px",
              background: "#000",
              border: "1px solid #000",
            }}
          ></div>
          <span style={{ fontWeight: "bold", fontSize: "12px" }}>
            Your Statistics
          </span>
        </div>

        <div style={{ padding: "16px" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
              gap: "12px",
            }}
          >
            {/* Played */}
            <div className="mac-inset" style={{ padding: "12px" }}>
              <div style={{ fontSize: "10px", marginBottom: "4px" }}>
                MATCHES PLAYED
              </div>
              <div
                style={{
                  fontSize: "24px",
                  fontWeight: "bold",
                  textAlign: "center",
                }}
              >
                0
              </div>
            </div>

            {/* Won */}
            <div className="mac-inset mac-green" style={{ padding: "12px" }}>
              <div style={{ fontSize: "10px", marginBottom: "4px" }}>
                MATCHES WON
              </div>
              <div
                style={{
                  fontSize: "24px",
                  fontWeight: "bold",
                  textAlign: "center",
                }}
              >
                0
              </div>
            </div>

            {/* Lost */}
            <div className="mac-inset mac-red" style={{ padding: "12px" }}>
              <div
                style={{
                  fontSize: "10px",
                  marginBottom: "4px",
                  color: "#fff",
                }}
              >
                MATCHES LOST
              </div>
              <div
                style={{
                  fontSize: "24px",
                  fontWeight: "bold",
                  textAlign: "center",
                  color: "#fff",
                }}
              >
                0
              </div>
            </div>

            {/* Drawn */}
            <div className="mac-inset mac-yellow" style={{ padding: "12px" }}>
              <div style={{ fontSize: "10px", marginBottom: "4px" }}>
                MATCHES DRAWN
              </div>
              <div
                style={{
                  fontSize: "24px",
                  fontWeight: "bold",
                  textAlign: "center",
                }}
              >
                0
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Matches Window */}
      <div className="mac-window" style={{ marginTop: "20px" }}>
        <div className="mac-title-bar">
          <div
            style={{
              width: "12px",
              height: "12px",
              background: "#000",
              border: "1px solid #000",
            }}
          ></div>
          <span
            style={{
              fontWeight: "bold",
              fontSize: "12px",
              flex: 1,
            }}
          >
            Recent Matches
          </span>
          <Link
            to="/matches/history"
            style={{
              fontSize: "11px",
              textDecoration: "none",
              color: "#0000ff",
            }}
          >
            View All →
          </Link>
        </div>

        <div style={{ padding: "16px" }}>
          <div
            className="mac-inset"
            style={{ padding: "40px", textAlign: "center" }}
          >
            <div
              style={{
                fontSize: "48px",
                marginBottom: "12px",
                filter: "grayscale(1)",
              }}
            >
              📋
            </div>
            <p style={{ fontSize: "12px", fontWeight: "bold", margin: 0 }}>
              No recent matches found
            </p>
            <p style={{ fontSize: "11px", margin: "8px 0 0 0" }}>
              Start a new match to see your match history here
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div
        className="mac-panel"
        style={{
          marginTop: "20px",
          padding: "12px",
          textAlign: "center",
        }}
      >
        <p style={{ fontSize: "11px", margin: 0 }}>
          © 1984-2024 Classic Computing Systems • Version 7.0.1
        </p>
      </div>
    </div>
  );
};

export default Home;
