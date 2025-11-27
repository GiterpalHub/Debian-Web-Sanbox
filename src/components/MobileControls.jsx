import { useState, useEffect } from "react";
import "./MobileControls.css";

function MobileControls() {
  const [isCtrlActive, setIsCtrlActive] = useState(false);

  useEffect(() => {
    const handler = (e) => setIsCtrlActive(e.detail);
    window.addEventListener("ctrl-toggle", handler);
    return () => window.removeEventListener("ctrl-toggle", handler);
  }, []);

  const getTarget = () => {
    return document.getElementById("terminal-input") || document.getElementById("editor-textarea");
  };

  const dispatchKeyEvent = (key, ctrl = false) => {
    const target = getTarget() || window;

    if (target.focus) target.focus();

    const event = new KeyboardEvent("keydown", {
      key,
      code: key,
      ctrlKey: ctrl || isCtrlActive,
      bubbles: true,
      cancelable: true,
    });

    target.dispatchEvent(event);

    if (isCtrlActive) {
      window.dispatchEvent(new CustomEvent("ctrl-toggle", { detail: false }));
    }
  };

  const handleKey = (key) => {
    if (key === "Control") {
      const next = !isCtrlActive;
      window.dispatchEvent(new CustomEvent("ctrl-toggle", { detail: next }));

      const target = getTarget();
      if (target && target.focus) target.focus();
    } else {
      dispatchKeyEvent(key);
    }
  };

  const handlePointerUp = (e, key) => {
    e.preventDefault();
    handleKey(key);
  };

  return (
    <div className="mobile-controls">
      <div className="mobile-key-group">
        <button 
          className={`mobile-btn ${isCtrlActive ? "active" : ""}`} 
          onPointerUp={(e) => handlePointerUp(e, "Control")}
        >
          Ctrl
        </button>

        {!isCtrlActive ? (
          <>
            <button className="mobile-btn" onPointerUp={(e) => handlePointerUp(e, "Tab")}>Tab</button>
            <button className="mobile-btn" onPointerUp={(e) => handlePointerUp(e, "Enter")}>Enter</button>
          </>
        ) : (
          <>
            <button className="mobile-btn" onPointerUp={(e) => handlePointerUp(e, "c")}>C</button>
            <button className="mobile-btn" onPointerUp={(e) => handlePointerUp(e, "v")}>V</button>
            <button className="mobile-btn" onPointerUp={(e) => handlePointerUp(e, "x")}>X</button>
            <button className="mobile-btn" onPointerUp={(e) => handlePointerUp(e, "l")}>L</button>
            <button className="mobile-btn" onPointerUp={(e) => handlePointerUp(e, "u")}>U</button>
            <button className="mobile-btn" onPointerUp={(e) => handlePointerUp(e, "d")}>D</button>
          </>
        )}
      </div>

      {!isCtrlActive && (
        <div className="mobile-key-group">
          <button className="mobile-btn" onPointerUp={(e) => handlePointerUp(e, "ArrowUp")}>&uarr;</button>
          <button className="mobile-btn" onPointerUp={(e) => handlePointerUp(e, "ArrowDown")}>&darr;</button>
        </div>
      )}
    </div>
  );
}

export default MobileControls;
