import React from "react";

interface ConsoleOutputProps {
  output: string[];
  isRunning?: boolean;
  hasError?: boolean;
}

const ConsoleOutput: React.FC<ConsoleOutputProps> = ({
  output,
  isRunning = false,
  hasError = false,
}) => {
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      {/* Classic Mac Title Bar */}
      <div
        style={{
          background: "#000000",
          color: "#FFFFFF",
          padding: "4px 12px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "2px solid #000000",
          fontFamily: '"Chicago", "Geneva", system-ui, sans-serif',
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {/* Classic window controls */}
          <div
            style={{
              width: "14px",
              height: "14px",
              background: "#FFFFFF",
              border: "2px solid #FFFFFF",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                width: "8px",
                height: "2px",
                background: "#000000",
              }}
            ></div>
          </div>
          <span
            style={{
              fontSize: "12px",
              fontWeight: "bold",
              letterSpacing: "0.5px",
            }}
          >
            System Terminal
          </span>
          {isRunning && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              <div
                className="mac-loading-inverted"
                style={{ width: "10px", height: "10px", borderWidth: "2px" }}
              ></div>
              <span style={{ fontSize: "9px" }}>Processing...</span>
            </div>
          )}
        </div>
        {hasError && (
          <div
            style={{
              fontSize: "9px",
              color: "#000000",
              background: "#FFFFFF",
              padding: "2px 6px",
              fontWeight: "bold",
            }}
          >
            ⚠ ERROR
          </div>
        )}
      </div>

      {/* Terminal Screen with CRT effect */}
      <div
        style={{
          flex: 1,
          padding: "12px",
          overflow: "auto",
          background: "#000000",
          color: "#00FF00",
          fontFamily: '"Monaco", "Courier New", Courier, monospace',
          fontSize: "13px",
          lineHeight: "1.5",
          border: "3px solid #000000",
          boxShadow: "inset 2px 2px 8px rgba(0, 255, 0, 0.1)",
          position: "relative",
        }}
      >
        {/* Scanline effect overlay */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background:
              "repeating-linear-gradient(0deg, rgba(0, 0, 0, 0.15) 0px, rgba(0, 0, 0, 0.15) 1px, transparent 1px, transparent 2px)",
            pointerEvents: "none",
            zIndex: 1,
          }}
        ></div>

        {/* Terminal content */}
        <div style={{ position: "relative", zIndex: 2 }}>
          {output.length === 0 ? (
            <div style={{ color: "#006600" }}>
              {isRunning ? (
                <>
                  <span style={{ color: "#00FF00" }}>System&gt;</span> Executing
                  program...
                  <br />
                  <span
                    className="mac-cursor-blink"
                    style={{ color: "#00FF00" }}
                  >
                    █
                  </span>
                </>
              ) : (
                <>
                  <span style={{ color: "#00FF00" }}>Macintosh System 7.5</span>
                  <br />
                  <span style={{ color: "#00AA00" }}>Terminal Ready</span>
                  <br />
                  <br />
                  <span style={{ color: "#006600" }}>
                    Type code and press Run...
                  </span>
                  <br />
                  <span
                    className="mac-cursor-blink"
                    style={{ color: "#00FF00" }}
                  >
                    █
                  </span>
                </>
              )}
            </div>
          ) : (
            <>
              {output.map((line, index) => {
                let lineColor = "#00FF00";
                let isBold = false;

                // Color coding for different types of output
                if (line.startsWith(">")) {
                  lineColor = "#00FFFF"; // Cyan for commands
                  isBold = true;
                } else if (line.includes("✓") || line.includes("PASSED")) {
                  lineColor = "#00FF00"; // Green for success
                } else if (
                  line.includes("✗") ||
                  line.includes("FAILED") ||
                  line.includes("ERROR")
                ) {
                  lineColor = "#FF0000"; // Red for errors
                  isBold = true;
                } else if (
                  line.includes("Input:") ||
                  line.includes("Expected:") ||
                  line.includes("Output:")
                ) {
                  lineColor = "#FFFF00"; // Yellow for test data
                } else if (line.includes("═") || line.includes("ACCEPTED")) {
                  lineColor = "#00FF00"; // Green for acceptance
                  isBold = true;
                } else if (
                  line.includes("Runtime:") ||
                  line.includes("Memory:") ||
                  line.includes("Beats")
                ) {
                  lineColor = "#FF00FF"; // Magenta for stats
                } else if (line.trim() === "") {
                  return <br key={index} />;
                } else if (line.startsWith("Test Case")) {
                  lineColor = "#00FFFF"; // Cyan for test headers
                }

                return (
                  <div
                    key={index}
                    style={{
                      marginBottom: "2px",
                      color:
                        hasError && index === output.length - 1
                          ? "#FF0000"
                          : lineColor,
                      fontWeight: isBold ? "bold" : "normal",
                      textShadow: "0 0 2px currentColor",
                    }}
                  >
                    {line}
                  </div>
                );
              })}

              {isRunning && (
                <div style={{ marginTop: "8px", color: "#00FF00" }}>
                  <span className="mac-cursor-blink">█</span>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Classic Mac Status Bar */}
      <div
        style={{
          background: "#C0C0C0",
          borderTop: "2px solid #000000",
          padding: "4px 12px",
          display: "flex",
          justifyContent: "space-between",
          fontSize: "10px",
          fontFamily: '"Geneva", "Chicago", system-ui, sans-serif',
          boxShadow: "inset 1px 1px 0 #FFFFFF, inset -1px -1px 0 #808080",
        }}
      >
        <div style={{ display: "flex", gap: "16px" }}>
          <span style={{ fontWeight: "bold" }}>Lines: {output.length}</span>
          <span>|</span>
          <span>
            {hasError
              ? "Status: Error"
              : output.length > 0
                ? "Status: Complete"
                : "Status: Ready"}
          </span>
        </div>
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          {isRunning ? (
            <>
              <div
                className="mac-loading"
                style={{ width: "8px", height: "8px", borderWidth: "1px" }}
              ></div>
              <span>Processing...</span>
            </>
          ) : hasError ? (
            <span>✗ Execution Failed</span>
          ) : output.length > 0 ? (
            <span>✓ Ready</span>
          ) : (
            <span>⊙ Idle</span>
          )}
        </div>
      </div>

      <style>{`
        @keyframes cursor-blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }
        .mac-cursor-blink {
          animation: cursor-blink 1s infinite;
        }

        @keyframes spinner-inverted {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .mac-loading-inverted {
          border: 2px solid #FFFFFF;
          border-top: 2px solid transparent;
          border-radius: 50%;
          width: 12px;
          height: 12px;
          animation: spinner-inverted 1s linear infinite;
        }

        /* CRT glow effect */
        @keyframes flicker {
          0% { opacity: 0.97; }
          50% { opacity: 1; }
          100% { opacity: 0.97; }
        }
      `}</style>
    </div>
  );
};

export default ConsoleOutput;
