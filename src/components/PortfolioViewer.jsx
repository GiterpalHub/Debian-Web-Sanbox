import { useState, useEffect } from "react";
import {
  templateHTML,
  templateCSS,
  templateJS,
} from "../data/portfolioTemplate.js";

const parseEnv = (envContent) => {
  const env = {};
  envContent.split("\n").forEach((line) => {
    if (line.startsWith("#") || !line.includes("=")) {
      return;
    }
    const [key, ...valueParts] = line.split("=");
    env[key.trim()] = valueParts.join("=").trim();
  });
  return env;
};

function PortfolioViewer({ username, slug, onExit }) {
  const [iframeSrcDoc, setIframeSrcDoc] = useState("");

  useEffect(() => {
    const effectiveUsername = username || "user";
    const envKey = `${effectiveUsername}_portfolio_env`;
    const savedEnv = localStorage.getItem(envKey);

    console.log("Loaded .env content:", savedEnv);
    if (savedEnv) {
      const parsed = parseEnv(savedEnv);

      let content = templateHTML
        .replace("{{CSS}}", templateCSS)
        .replace("{{JS}}", templateJS);

      Object.keys(parsed).forEach((key) => {
        const regex = new RegExp(`{{${key}}}`, "g");
        content = content.replace(regex, parsed[key]);
      });

      setIframeSrcDoc(content);
    }
  }, [username, slug]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: "100%", 
        backgroundColor: "#eee",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "8px 12px",
          backgroundColor: "#fff",
          borderBottom: "1px solid #ccc",
        }}
      >
        <div>
          <strong>URL:</strong>
          <span style={{ color: "#0000aa" }}> /result/{slug}</span>
        </div>
        <button
          onClick={onExit}
          style={{
            padding: "5px 10px",
            fontFamily: "Consolas, monospace",
            fontSize: "1rem",
          }}
        >
          &lt; Back to Terminal
        </button>
      </div>
      <iframe
        srcDoc={iframeSrcDoc}
        title="Portfolio Preview"
        style={{
          width: "100%",
          flexGrow: 1,
          border: "none",
          backgroundColor: "#f4f4f9",
        }}
        sandbox="allow-scripts allow-same-origin"
      />
    </div>
  );
}

export default PortfolioViewer;
