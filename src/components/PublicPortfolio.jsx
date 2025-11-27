import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  templateHTML,
  templateCSS,
  templateJS,
} from "../data/portfolioTemplate.js";
import "./PortfolioLoader.css";
import { APPS_SCRIPT_URL } from "../data/environment.js";

const parseEnv = (envContent) => {
  const env = {};
  envContent.split("\n").forEach((line) => {
    if (line.startsWith("#") || !line.includes("=")) return;
    const [key, ...valueParts] = line.split("=");
    env[key.trim()] = valueParts.join("=").trim();
  });
  return env;
};

const LoadingState = () => (
  <div className="loader-container">
    <div className="dots-loader">
      <span></span>
      <span></span>
      <span></span>
    </div>
    <div className="loader-text">Fetching Portfolio Data...</div>
  </div>
);

const ErrorState = ({ message }) => (
  <div className="loader-container">
    <h1 className="error-title">404</h1>
    <p className="error-message">
      {message.includes("Slug not found")
        ? "Portfolio not found."
        : "An error occurred."}
    </p>
    <Link to="/" className="home-link">
      &lt; Back to Sandbox
    </Link>
  </div>
);

function PublicPortfolio() {
  const { slug } = useParams();
  const [iframeSrcDoc, setIframeSrcDoc] = useState("");
  const [status, setStatus] = useState("loading");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!slug) return;

    setStatus("loading");

    fetch(`${APPS_SCRIPT_URL}?slug=${slug}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.status === "success") {
          const parsed = parseEnv(data.envContent);

          let content = templateHTML
            .replace("{{CSS}}", templateCSS)
            .replace("{{JS}}", templateJS);

          Object.keys(parsed).forEach((key) => {
            const regex = new RegExp(`{{${key}}}`, "g");
            content = content.replace(regex, parsed[key]);
          });

          setIframeSrcDoc(content);
          setStatus("success");
        } else {
          throw new Error(data.message);
        }
      })
      .catch((err) => {
        setErrorMessage(err.message || "Failed to load data.");
        setStatus("error");
      });
  }, [slug]);

  if (status === "loading") {
    return <LoadingState />;
  }

  if (status === "error") {
    return <ErrorState message={errorMessage} />;
  }

  return (
    <iframe
      srcDoc={iframeSrcDoc}
      title="Portfolio Preview"
      style={{
        width: "100%",
        height: "100%", 
        border: "none",
        backgroundColor: "#f4f4f9",
      }}
      sandbox="allow-scripts allow-same-origin"
    />
  );
}

export default PublicPortfolio;
