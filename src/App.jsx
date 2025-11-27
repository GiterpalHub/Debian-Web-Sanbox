import { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import Sandbox from "./Sandbox.jsx";
import PublicPortfolio from "./components/PublicPortfolio.jsx";
import "./index.css";

function App() {
  useEffect(() => {
    const setAppHeight = () => {
      const doc = document.documentElement;
      if (window.visualViewport) {
        doc.style.setProperty("--app-height", `${window.visualViewport.height}px`);
      } else {
        doc.style.setProperty("--app-height", `${window.innerHeight}px`);
      }
    };

    setAppHeight();

    if (window.visualViewport) {
      window.visualViewport.addEventListener("resize", setAppHeight);
      window.visualViewport.addEventListener("scroll", setAppHeight);
    }
    window.addEventListener("resize", setAppHeight);

    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener("resize", setAppHeight);
        window.visualViewport.removeEventListener("scroll", setAppHeight);
      }
      window.removeEventListener("resize", setAppHeight);
    };
  }, []);

  return (
    <Routes>
      <Route path="/" element={<Sandbox />} />
      <Route path="/result/:slug" element={<PublicPortfolio />} />
    </Routes>
  );
}

export default App;
