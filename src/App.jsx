import { useState, useEffect, useRef } from "react";
import Terminal from "./components/Terminal.jsx";
import PartitionMenu from "./components/PartitionMenu.jsx";
import {
  installSteps,
  fullBootLines,
  installLogMap,
} from "./data/installData.js";
import { STORAGE_KEY } from "./data/environment.js";

function App() {
  const [currentStep, setCurrentStep] = useState(0);
  const [inputValue, setInputValue] = useState("");
  const [selectedOption, setSelectedOption] = useState(
    Array.isArray(installSteps[0].default)
      ? installSteps[0].default[0]
      : installSteps[0].default
  );
  const [stepError, setStepError] = useState("");
  const [showTerminal, setShowTerminal] = useState(false);
  const [userData, setUserData] = useState({});
  const [installLog, setInstallLog] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isDirectBooting, setIsDirectBooting] = useState(false);
  const [directBootLog, setDirectBootLog] = useState([]);
  const [didDirectBoot, setDidDirectBoot] = useState(false);

  const inputRef = useRef(null);
  const optionListRef = useRef(null);
  const installLogRef = useRef(null);

  const step = installSteps[currentStep];

  useEffect(() => {
    const savedUser = localStorage.getItem(STORAGE_KEY);
    if (savedUser) {
      setUserData(JSON.parse(savedUser));
      document.body.classList.add("terminal-mode");
      setIsDirectBooting(true);
    } else {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (step) {
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
    if (isDirectBooting) {
      let logIndex = 0;
      const interval = setInterval(() => {
        if (logIndex < fullBootLines.length) {
          setDirectBootLog((prev) => [...prev, fullBootLines[logIndex]]);
          logIndex++;
        } else {
          clearInterval(interval);
          setTimeout(() => {
            setIsDirectBooting(false);
            setIsLoading(false);
            setShowTerminal(true);
            setDidDirectBoot(true);
          }, 500);
        }
      }, 120);

      return () => clearInterval(interval);
    }
  }, [isDirectBooting]);

  useEffect(() => {
    if (installLogRef.current) {
      installLogRef.current.scrollTop = installLogRef.current.scrollHeight;
    }
  }, [installLog, directBootLog]);

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

      document.body.classList.add("terminal-mode");
      setTimeout(() => {
        setShowTerminal(true);
      }, 500);
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
    handleNext();
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

  if (showTerminal) {
    return <Terminal userData={userData} skipBoot={didDirectBoot} />;
  }

  if (isDirectBooting) {
    return (
      <div
        ref={installLogRef}
        className="terminal-container"
        style={{
          backgroundColor: "#0d0d0d",
          color: "#d0d0d0",
          fontFamily: "monospace",
          height: "100vh",
          width: "100%",
        }}
      >
        {directBootLog.map((line, index) => (
          <pre key={index} style={{ color: "#d0d0d0", fontSize: "0.9rem" }}>
            {line}
          </pre>
        ))}
      </div>
    );
  }

  if (isLoading) {
    return null;
  }

  if (!step) {
    return null;
  }

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
              <pre key={index} style={{ color: "#d0d0d0", fontSize: "0.9rem" }}>
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
            step.type === "info" || (step.type === "input" && !inputRef.current)
          }
          disabled={step.type === "installing" || step.type === "partitionMenu"}
        >
          &lt;Continue&gt;
        </button>
      </div>
    </div>
  );
}

export default App;
