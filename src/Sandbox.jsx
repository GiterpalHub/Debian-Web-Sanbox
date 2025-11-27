import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Terminal from "./components/Terminal.jsx";
import PartitionMenu from "./components/PartitionMenu.jsx";
import MobileControls from "./components/MobileControls.jsx";
import "./components/MobileControls.css";
import {
  installSteps,
  fullBootLines,
  installLogMap,
} from "./data/installData.js";
import { STORAGE_KEY, FILESYSTEM_KEY_PREFIX } from "./data/environment.js";

function BootScreen({ onBootComplete }) {
  const [bootLog, setBootLog] = useState([]);
  const installLogRef = useRef(null);

  useEffect(() => {
    if (installLogRef.current) {
      installLogRef.current.scrollTop = installLogRef.current.scrollHeight;
    }
  }, [bootLog]);

  useEffect(() => {
    let logIndex = 0;
    const interval = setInterval(() => {
      if (logIndex < fullBootLines.length) {
        setBootLog((prevLogs) => [...prevLogs, fullBootLines[logIndex]]);
        logIndex++;
      } else {
        clearInterval(interval);
        setTimeout(onBootComplete, 500);
      }
    }, 120);

    return () => clearInterval(interval);
  }, [onBootComplete]);

  return (
    <div
      ref={installLogRef}
      className="terminal-container"
      style={{
        backgroundColor: "#0d0d0d",
        color: "#d0d0d0",
        fontFamily: "monospace",
        height: "100%", 
        width: "100%",
      }}
    >
      {bootLog.map((line, index) => (
        <pre key={index} style={{ color: "#d0d0d0", fontSize: "0.9rem" }}>
          {(line && line.text) || line}
        </pre>
      ))}
    </div>
  );
}

function Sanbox() {
  const [currentStep, setCurrentStep] = useState(0);
  const [inputValue, setInputValue] = useState("");
  const [selectedOption, setSelectedOption] = useState(
    Array.isArray(installSteps[0].default)
      ? installSteps[0].default[0]
      : installSteps[0].default
  );
  const [stepError, setStepError] = useState("");

  const [userData, setUserData] = useState(null);
  const [installLog, setInstallLog] = useState([]);
  const [isPartitioned, setIsPartitioned] = useState(false);

  const [viewMode, setViewMode] = useState("loading");
  const [portfolioSlug, setPortfolioSlug] = useState("");
  const [startLoggedIn, setStartLoggedIn] = useState(false);

  const navigate = useNavigate();

  const inputRef = useRef(null);
  const optionListRef = useRef(null);
  const installLogRef = useRef(null);

  const step = installSteps[currentStep];

  useEffect(() => {
    const savedUser = localStorage.getItem(STORAGE_KEY);
    if (savedUser) {
      const user = JSON.parse(savedUser);
      setUserData(user);
      document.body.classList.add("terminal-mode");

      const savedSlug = localStorage.getItem(`${user.username}_portfolio_slug`);
      if (savedSlug) {
        setPortfolioSlug(savedSlug);
      }

      setStartLoggedIn(false);
      setViewMode("booting");
    } else {
      setStartLoggedIn(false);
      setViewMode("installer");
    }
  }, []);

  useEffect(() => {
    if (step) {
      if (step.type !== "partitionMenu") {
        setIsPartitioned(false);
      }
      if (step.type === "input") {
        setInputValue(step.default || "");
        if (inputRef.current) {
          inputRef.current.focus();
        }
      } else if (step.type === "options") {
        const defaultOption = Array.isArray(step.default)
          ? step.default[0]
          : step.default;
        setSelectedOption(defaultOption);
        setStepError("");
        if (optionListRef.current) {
          optionListRef.current.focus();
        }
      } else if (step.type === "installing") {
        setInstallLog([]);
      }
    }
  }, [currentStep, step]);

  useEffect(() => {
    if (step && step.type === "installing") {
      const logsToRun = installLogMap[step.logKey] || [];
      let logIndex = 0;

      const interval = setInterval(() => {
        if (logIndex < logsToRun.length) {
          setInstallLog((prev) => [...prev, logsToRun[logIndex]]);
          logIndex++;
        } else {
          clearInterval(interval);
          setTimeout(handleNext, 1000);
        }
      }, 150);

      return () => clearInterval(interval);
    }
  }, [currentStep, step]);

  useEffect(() => {
    if (installLogRef.current) {
      installLogRef.current.scrollTop = installLogRef.current.scrollHeight;
    }
  }, [installLog]);

  const handleNext = () => {
    if (step.type === "options") {
      const isValid = Array.isArray(step.default)
        ? step.default.includes(selectedOption)
        : selectedOption === step.default;

      if (!isValid) {
        setStepError(step.error || "This option is not available.");
        return;
      }
    }

    if (step.type === "partitionMenu" && !isPartitioned) {
      setStepError(
        "No partition scheme has been created. Use 'Guided partitioning'."
      );
      return;
    }

    if (step.type === "input" && step.key) {
      if (step.key === "partitionSize") {
        const size = parseFloat(inputValue);
        if (isNaN(size) || size < 4 || size > 12) {
          setStepError("Please enter a size between 4 and 12 GB.");
          return;
        }
      }
      setUserData((prev) => ({ ...prev, [step.key]: inputValue }));
    }

    if (step.title === "Installation Complete") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
      window.location.reload();
      return;
    }

    if (currentStep < installSteps.length - 1) {
      setStepError("");
      setCurrentStep((prev) => prev + 1);
      setInputValue("");
    }
  };

  const handlePartitionComplete = (partitionSize) => {
    setUserData((prev) => ({ ...prev, partitionSize: partitionSize }));
    setIsPartitioned(true);
  };

  const handleInputSubmit = (e) => {
    e.preventDefault();
    handleNext();
  };

  const handleOptionKeyDown = (e) => {
    if (e.key === "ArrowUp") {
      e.preventDefault();
      const currentIndex = step.options.indexOf(selectedOption);
      if (currentIndex > 0) {
        setSelectedOption(step.options[currentIndex - 1]);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      const currentIndex = step.options.indexOf(selectedOption);
      if (currentIndex < step.options.length - 1) {
        setSelectedOption(step.options[currentIndex + 1]);
      }
    } else if (e.key === "Enter") {
      e.preventDefault();
      handleNext();
    }
  };

  const handleDeploy = (slug) => {
    navigate(`/result/${slug}`);
  };

  const handleFullReset = () => {
    if (userData) {
      const fsKey = `${FILESYSTEM_KEY_PREFIX}${userData.username || "user"}`;
      localStorage.removeItem(fsKey);
      localStorage.removeItem(`${userData.username}_portfolio_slug`);
      localStorage.removeItem(`${userData.username}_portfolio_env`);
    }
    localStorage.removeItem(STORAGE_KEY);
    window.location.reload();
  };

  if (viewMode === "loading") {
    return null;
  }

  if ((viewMode === "terminal" || viewMode === "portfolio") && !userData) {
    return null;
  }

  if (viewMode === "installer" && step) {
    const renderContent = () => {
      switch (step.type) {
        case "input":
          return (
            <form onSubmit={handleInputSubmit} className="input-area">
              <label>{step.prompt}</label>
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
              />
            </form>
          );
        case "options":
          return (
            <div
              ref={optionListRef}
              className="option-list"
              tabIndex="0"
              onKeyDown={handleOptionKeyDown}
            >
              {step.options.map((option) => (
                <div
                  key={option}
                  className={`option-item ${
                    option === selectedOption ? "selected" : ""
                  }`}
                  onClick={() => setSelectedOption(option)}
                  onDoubleClick={handleNext}
                >
                  {option}
                </div>
              ))}
            </div>
          );
        case "partitionMenu":
          return (
            <PartitionMenu
              onComplete={handlePartitionComplete}
              onError={(msg) => setStepError(msg)}
            />
          );
        case "installing":
          return (
            <div
              ref={installLogRef}
              className="partition-info"
              style={{
                height: "200px",
                overflowY: "auto",
                backgroundColor: "#0d0d0d",
                color: "#d0d0d0",
                fontFamily: "monospace",
              }}
            >
              {installLog.map((line, index) => (
                <pre
                  key={index}
                  style={{ color: "#d0d0d0", fontSize: "0.9rem" }}
                >
                  {line}
                </pre>
              ))}
            </div>
          );
        case "info":
        default:
          return null;
      }
    };

    return (
      <div className="installer-window">
        <div className="title-bar">{step.title}</div>
        <div className="content">
          <p>{step.text}</p>
          {renderContent()}
          {stepError && <div className="error-message">{stepError}</div>}
        </div>
        <div className="button-bar">
          <button
            onClick={handleNext}
            autoFocus={
              step.type === "info" ||
              (step.type === "input" && !inputRef.current)
            }
            disabled={
              step.type === "installing" ||
              (step.type === "partitionMenu" && !isPartitioned)
            }
          >
            &lt;Continue&gt;
          </button>
        </div>
      </div>
    );
  }

  if (viewMode === "booting") {
    return <BootScreen onBootComplete={() => setViewMode("terminal")} />;
  }

  if (viewMode === "terminal") {
    return (
      <>
        <Terminal
          userData={userData}
          startLoggedIn={startLoggedIn}
          onDeploy={handleDeploy}
          onFullReset={handleFullReset}
        />
        <MobileControls />
      </>
    );
  }

  return null;
}

export default Sanbox;
