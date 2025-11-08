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
    <div className="editor-container">
      <div className="editor-header">{headerText}</div>
      <textarea
        ref={textAreaRef}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        spellCheck="false"
        className="editor-textarea"
      />
      <div className="editor-footer">{footerText}</div>
    </div>
  );
}

export default Editor;
