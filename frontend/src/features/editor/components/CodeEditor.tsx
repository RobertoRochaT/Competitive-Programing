import React, { useState } from "react";
import Editor from "@monaco-editor/react";
import type { editor } from "monaco-editor";

interface CodeEditorProps {
  language: string;
  value: string;
  onChange: (value: string) => void;
  readOnly?: boolean;
}

const CodeEditor: React.FC<CodeEditorProps> = ({
  language,
  value,
  onChange,
  readOnly = false,
}) => {
  const [isEditorReady, setIsEditorReady] = useState(false);

  const handleEditorChange = (value: string | undefined) => {
    onChange(value || "");
  };

  const handleEditorDidMount = (
    _editor: editor.IStandaloneCodeEditor,
    monaco: typeof import("monaco-editor"),
  ) => {
    // Define MacOS 9 Theme
    monaco.editor.defineTheme("macos9", {
      base: "vs",
      inherit: true,
      rules: [
        { token: "", foreground: "000000", background: "FFFFFF" },
        { token: "comment", foreground: "008000", fontStyle: "italic" },
        { token: "keyword", foreground: "0000FF", fontStyle: "bold" },
        { token: "string", foreground: "A31515" },
        { token: "number", foreground: "098658" },
        { token: "regexp", foreground: "811F3F" },
        { token: "operator", foreground: "000000" },
        { token: "namespace", foreground: "267F99" },
        { token: "type", foreground: "267F99" },
        { token: "struct", foreground: "267F99" },
        { token: "class", foreground: "267F99" },
        { token: "interface", foreground: "267F99" },
        { token: "parameter", foreground: "001080" },
        { token: "variable", foreground: "001080" },
        { token: "function", foreground: "795E26" },
        { token: "delimiter", foreground: "000000" },
      ],
      colors: {
        "editor.foreground": "#000000",
        "editor.background": "#FFFFFF",
        "editor.selectionBackground": "#000080",
        "editor.lineHighlightBackground": "#FFFACD",
        "editorCursor.foreground": "#000000",
        "editorWhitespace.foreground": "#CCCCCC",
        "editorIndentGuide.background": "#D3D3D3",
        "editorIndentGuide.activeBackground": "#939393",
        "editor.selectionHighlightBackground": "#ADD6FF",
        "editorLineNumber.foreground": "#808080",
        "editorLineNumber.activeForeground": "#000000",
        "scrollbar.shadow": "#000000",
        "scrollbarSlider.background": "#C0C0C0",
        "scrollbarSlider.hoverBackground": "#A0A0A0",
        "scrollbarSlider.activeBackground": "#808080",
      },
    });

    // Define MacOS 9 Dark Theme (classic green terminal style)
    monaco.editor.defineTheme("macos9-terminal", {
      base: "vs-dark",
      inherit: true,
      rules: [
        { token: "", foreground: "00FF00", background: "000000" },
        { token: "comment", foreground: "00AA00", fontStyle: "italic" },
        { token: "keyword", foreground: "00FFFF", fontStyle: "bold" },
        { token: "string", foreground: "FFFF00" },
        { token: "number", foreground: "FF00FF" },
        { token: "regexp", foreground: "FF6600" },
        { token: "operator", foreground: "00FF00" },
        { token: "namespace", foreground: "00FFFF" },
        { token: "type", foreground: "00FFFF" },
        { token: "struct", foreground: "00FFFF" },
        { token: "class", foreground: "00FFFF" },
        { token: "interface", foreground: "00FFFF" },
        { token: "parameter", foreground: "00FF00" },
        { token: "variable", foreground: "00FF00" },
        { token: "function", foreground: "FFFF00" },
        { token: "delimiter", foreground: "00FF00" },
      ],
      colors: {
        "editor.foreground": "#00FF00",
        "editor.background": "#000000",
        "editor.selectionBackground": "#003300",
        "editor.lineHighlightBackground": "#001100",
        "editorCursor.foreground": "#00FF00",
        "editorWhitespace.foreground": "#003300",
        "editorIndentGuide.background": "#002200",
        "editorIndentGuide.activeBackground": "#004400",
        "editor.selectionHighlightBackground": "#003300",
        "editorLineNumber.foreground": "#006600",
        "editorLineNumber.activeForeground": "#00FF00",
        "scrollbar.shadow": "#000000",
        "scrollbarSlider.background": "#003300",
        "scrollbarSlider.hoverBackground": "#005500",
        "scrollbarSlider.activeBackground": "#007700",
      },
    });

    monaco.editor.setTheme("macos9");
    setIsEditorReady(true);
  };

  return (
    <div
      style={{
        position: "relative",
        height: "100%",
        background: "#FFFFFF",
      }}
    >
      {/* Mac System 7 style border */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          border: "2px solid #000000",
          boxShadow: "inset -1px -1px 0 #FFFFFF, inset 1px 1px 0 #808080",
        }}
      >
        {!isEditorReady && (
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              zIndex: 10,
              textAlign: "center",
            }}
          >
            <div className="mac-loading"></div>
            <div
              className="mac-panel"
              style={{
                marginTop: "16px",
                padding: "8px 16px",
              }}
            >
              <p
                style={{
                  margin: 0,
                  fontSize: "12px",
                  fontWeight: "bold",
                }}
              >
                Loading CodeWarrior IDE...
              </p>
            </div>
          </div>
        )}

        <Editor
          height="100%"
          language={language}
          value={value}
          onChange={handleEditorChange}
          onMount={handleEditorDidMount}
          theme="macos9"
          options={{
            readOnly: readOnly,
            minimap: { enabled: false },
            fontSize: 13,
            fontFamily: '"Monaco", "Courier New", Courier, monospace',
            lineNumbers: "on",
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 4,
            wordWrap: "off",
            renderLineHighlight: "line",
            cursorStyle: "block",
            cursorBlinking: "solid",
            cursorWidth: 8,
            renderWhitespace: "none",
            folding: false,
            glyphMargin: false,
            scrollbar: {
              vertical: "visible",
              horizontal: "visible",
              verticalScrollbarSize: 18,
              horizontalScrollbarSize: 18,
              useShadows: false,
            },
            overviewRulerLanes: 0,
            hideCursorInOverviewRuler: true,
            overviewRulerBorder: false,
            lineDecorationsWidth: 0,
            lineNumbersMinChars: 4,
            renderLineHighlightOnlyWhenFocus: false,
            selectOnLineNumbers: true,
            roundedSelection: false,
            smoothScrolling: false,
            fontLigatures: false,
            padding: {
              top: 8,
              bottom: 8,
            },
          }}
        />
      </div>

      {/* Classic Mac scrollbar decorations */}
      <style>{`
        .monaco-editor .overflow-guard {
          border-radius: 0 !important;
        }

        .monaco-editor .monaco-scrollable-element > .scrollbar > .slider {
          background: #C0C0C0 !important;
          border: 2px solid #000000 !important;
          border-radius: 0 !important;
          box-shadow: inset -1px -1px 0 #808080, inset 1px 1px 0 #FFFFFF !important;
        }

        .monaco-editor .monaco-scrollable-element > .scrollbar > .slider:hover {
          background: #B0B0B0 !important;
        }

        .monaco-editor .monaco-scrollable-element > .scrollbar > .slider.active {
          background: #A0A0A0 !important;
        }

        .monaco-editor .monaco-scrollable-element > .scrollbar {
          background: #DDDDDD !important;
          border: 1px solid #000000 !important;
        }

        .monaco-editor .margin {
          background: #F0F0F0 !important;
          border-right: 1px solid #C0C0C0 !important;
        }

        .monaco-editor .line-numbers {
          color: #000000 !important;
          font-weight: normal !important;
        }

        .monaco-editor .current-line ~ .line-numbers {
          color: #000000 !important;
          font-weight: bold !important;
        }

        .monaco-editor .cursor {
          background: #000000 !important;
          border: none !important;
        }
      `}</style>
    </div>
  );
};

export default CodeEditor;
