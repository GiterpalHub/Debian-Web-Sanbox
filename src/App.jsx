import { useState, useEffect, useRef } from 'react';
import Terminal from './components/Terminal.jsx';
import PartitionMenu from './components/PartitionMenu.jsx';
import { 
  installSteps, 
  fakeSystemInstallLogs, 
  fakeGrubInstallLogs, 
  fakeFinalConfigLogs 
} from './data/installData.js';

const installLogMap = {
  system: fakeSystemInstallLogs,
  grub: fakeGrubInstallLogs,
  finalConfig: fakeFinalConfigLogs,
};

function App() {
  const [currentStep, setCurrentStep] = useState(0);
  const [inputValue, setInputValue] = useState('');
  const [selectedOption, setSelectedOption] = useState(installSteps[0].default);
  const [stepError, setStepError] = useState('');
  const [showTerminal, setShowTerminal] = useState(false);
  const [userData, setUserData] = useState({});
  const [installLog, setInstallLog] = useState([]);
  const inputRef = useRef(null);
  const optionListRef = useRef(null);
  const installLogRef = useRef(null);

  const step = installSteps[currentStep];

  useEffect(() => {
    if (step) {
      if (step.type === 'input') {
        setInputValue(step.default || '');
        if (inputRef.current) {
            inputRef.current.focus();
        }
      } else if (step.type === 'options') {
        setSelectedOption(step.default);
        setStepError('');
        if (optionListRef.current) {
            optionListRef.current.focus();
        }
      } else if (step.type === 'installing') {
        setInstallLog([]);
      }
    }
  }, [currentStep, step]);

  useEffect(() => {
    if (step && step.type === 'installing') {
      const logsToRun = installLogMap[step.logKey] || [];
      let logIndex = 0;
      
      const interval = setInterval(() => {
        if (logIndex < logsToRun.length) {
          setInstallLog(prev => [...prev, logsToRun[logIndex]]);
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
    if (step.type === 'options') {
      if (selectedOption !== step.default) {
        setStepError(step.error || "This option is not available.");
        return;
      }
    }

    if (step.type === 'input' && step.key) {
      setUserData(prev => ({ ...prev, [step.key]: inputValue }));
    }

    if (step.title === "Installation Complete") {
      document.body.classList.add('terminal-mode');
      setTimeout(() => {
        setShowTerminal(true);
      }, 500);
      return;
    }
    
    if (currentStep < installSteps.length - 1) {
      setStepError('');
      setCurrentStep(prev => prev + 1);
      setInputValue('');
    }
  };

  const handlePartitionComplete = (partitionSize) => {
    setUserData(prev => ({ ...prev, partitionSize: partitionSize }));
    handleNext();
  };

  const handleInputSubmit = (e) => {
    e.preventDefault();
    handleNext();
  };

  const handleOptionKeyDown = (e) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      const currentIndex = step.options.indexOf(selectedOption);
      if (currentIndex > 0) {
        setSelectedOption(step.options[currentIndex - 1]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const currentIndex = step.options.indexOf(selectedOption);
      if (currentIndex < step.options.length - 1) {
        setSelectedOption(step.options[currentIndex + 1]);
      }
    } else if (e.key === 'Enter') {
      e.preventDefault();
      handleNext();
    }
  };

  if (showTerminal) {
    return <Terminal userData={userData} />;
  }

  if (!step) {
    return null;
  }

  const renderContent = () => {
    switch (step.type) {
      case 'input':
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
      case 'options':
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
                className={`option-item ${option === selectedOption ? 'selected' : ''}`}
                onClick={() => setSelectedOption(option)}
                onDoubleClick={handleNext}
              >
                {option}
              </div>
            ))}
          </div>
        );
      case 'partitionMenu':
        return (
          <PartitionMenu 
            onComplete={handlePartitionComplete}
            onError={(msg) => setStepError(msg)}
          />
        );
      case 'installing':
        return (
          <div ref={installLogRef} className="partition-info" style={{ height: '200px', overflowY: 'auto', backgroundColor: '#0d0d0d', color: '#d0d0d0', fontFamily: 'monospace' }}>
            {installLog.map((line, index) => (
              <pre key={index} style={{color: '#d0d0d0', fontSize: '0.9rem'}}>{line}</pre>
            ))}
          </div>
        );
      case 'info':
      default:
        return null;
    }
  };

  return (
    <div className="installer-window">
      <div className="title-bar">
        {step.title}
      </div>
      <div className="content">
        <p>{step.text}</p>
        {renderContent()}
        {stepError && <div className="error-message">{stepError}</div>}
      </div>
      <div className="button-bar">
        <button
          onClick={handleNext}
          autoFocus={step.type === 'info' || (step.type === 'input' && !inputRef.current)}
          disabled={step.type === 'installing' || step.type === 'partitionMenu'}
        >
          &lt;Continue&gt;
        </button>
      </div>
    </div>
  );
}

export default App;
