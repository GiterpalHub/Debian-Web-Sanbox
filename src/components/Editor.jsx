import { useState, useEffect, useRef } from "react";

function Editor({ mode, filePath, initialContent, onExit }) {
  const [content, setContent] = useState(initialContent);
  const textAreaRef = useRef(null);

  useEffect(() => {
    if (textAreaRef.current) {
      textAreaRef.current.focus();
    }

    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.key === "x") {
        e.preventDefault();
        onExit(content);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [content, onExit]);

  const headerText =
    mode === "nano" ? `GNU nano 5.4  File: ${filePath}` : `VI - ${filePath}`;

  const footerText =
    mode === "nano" ? "[ ^X Exit ]" : "[ Press Ctrl+X to save and exit ]";

  return (
    <div
      className="text-editor"
      style={{
        backgroundColor: "#00002a",
        color: "#ffffff",
        width: "100%",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        fontFamily: "'Consolas', 'Menlo', 'Courier New', monospace",
      }}
    >
      <div
        style={{
          backgroundColor: "#bbbbbb",
          color: "#000000",
          padding: "2px 5px",
          fontWeight: "bold",
        }}
      >
        {headerText}
      </div>
      <textarea
        ref={textAreaRef}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        spellCheck="false"
        style={{
          flexGrow: 1,
          width: "100%",
          backgroundColor: "transparent",
          color: "#ffffff",
          border: "none",
          outline: "none",
          resize: "none",
          fontFamily: "inherit",
          fontSize: "1.1rem",
          padding: "5px 10px",
        }}
      />
      <div
        style={{
          backgroundColor: "#bbbbbb",
          color: "#000000",
          padding: "2px 5px",
          fontWeight: "bold",
        }}
      >
        {footerText}
      </div>
    </div>
  );
}

export default Editor;
