import { useState, useEffect } from "react";
import "./MobileControls.css";

function MobileControls() {
  const [isCtrlActive, setIsCtrlActive] = useState(false);

  const dispatchKeyEvent = (key, ctrl = false) => {
    const event = new KeyboardEvent("keydown", {
      key,
      code: key,
      ctrlKey: ctrl || isCtrlActive,
      bubbles: true,
      cancelable: true,
    });

    const active = document.activeElement || window;
    active.dispatchEvent(event);
    if (active !== window) window.dispatchEvent(event);

    if (isCtrlActive) setIsCtrlActive(false);
  };

  const handleKey = (key) => {
    if (key === "Control") {
      const next = !isCtrlActive;
      setIsCtrlActive(next);
      window.dispatchEvent(new CustomEvent("ctrl-toggle", { detail: next }));
    } else dispatchKeyEvent(key);
  };

  useEffect(() => {
    const bar = document.querySelector(".mobile-controls");
    if (!window.visualViewport || !bar) return;

    const update = () => {
      const h = window.innerHeight - window.visualViewport.height;
      bar.style.transform = h > 0 ? `translateY(-${h}px)` : "translateY(0)";
    };

    window.visualViewport.addEventListener("resize", update);
    window.visualViewport.addEventListener("scroll", update);
    update();
    return () => {
      window.visualViewport.removeEventListener("resize", update);
      window.visualViewport.removeEventListener("scroll", update);
    };
  }, []);

  return (
    <div className="mobile-controls">
      <div className="mobile-key-group">
        <button className={`mobile-btn ${isCtrlActive ? "active" : ""}`} onPointerDown={e => { e.preventDefault(); handleKey("Control"); }}>Ctrl</button>
        <button className="mobile-btn" onPointerDown={e => { e.preventDefault(); handleKey("Tab"); }}>Tab</button>
        <button className="mobile-btn" onPointerDown={e => { e.preventDefault(); handleKey("Enter"); }}>Enter</button>
      </div>
      <div className="mobile-key-group">
        <button className="mobile-btn" onPointerDown={e => { e.preventDefault(); handleKey("ArrowLeft"); }}>&larr;</button>
        <button className="mobile-btn" onPointerDown={e => { e.preventDefault(); handleKey("ArrowUp"); }}>&uarr;</button>
        <button className="mobile-btn" onPointerDown={e => { e.preventDefault(); handleKey("ArrowDown"); }}>&darr;</button>
        <button className="mobile-btn" onPointerDown={e => { e.preventDefault(); handleKey("ArrowRight"); }}>&rarr;</button>
      </div>
    </div>
  );
}

export default MobileControls;

