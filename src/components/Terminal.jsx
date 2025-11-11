import { useState, useEffect, useRef } from "react";
import { fullBootLines } from "../data/installData.js";
import Editor from "./Editor.jsx";
import { processCommand, setFsNode, getDirNode, resolvePath, createFileSystem } from "../utils/commandLogic.js";
import { BOOT_DELAY_MS, EXIT_DELAY_MS, CHALLENGE_KEY, FILESYSTEM_KEY_PREFIX } from "../data/environment.js";
import { getInitialChallengeTasks, checkChallengeProgress } from "../data/challengeData.js";

function Terminal({ userData, startLoggedIn, onDeploy, onFullReset }) {
  const [history, setHistory] = useState([]);
  const [input, setInput] = useState("");
  const [loggedIn, setLoggedIn] = useState(startLoggedIn);
  const [isBooting, setIsBooting] = useState(!startLoggedIn);
  const [isTerminated, setIsTerminated] = useState(false);
  const [fileSystem, setFileSystem] = useState(null);
  const [isFsLoaded, setIsFsLoaded] = useState(false);
  const [currentDir, setCurrentDir] = useState("/");
  const [editorState, setEditorState] = useState({ mode: "none", filePath: "", content: "" });
  const [isChallengeMode, setIsChallengeMode] = useState(false);
  const homeDir = `/home/${userData.username || "user"}`;
  const [challengeTasks, setChallengeTasks] = useState(getInitialChallengeTasks(homeDir));
  const [commandHistory, setCommandHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isAnimating, setIsAnimating] = useState(false);
  const initialPrompt = `${userData.username || "user"}@${userData.hostname || "debian"}:~$ `;
  const [userPrompt, setUserPrompt] = useState(initialPrompt);
  const inputRef = useRef(null);
  const terminalRef = useRef(null);
  const loginPrompt = "debian login: ";

  const [isCtrlActiveGlobal, setIsCtrlActiveGlobal] = useState(false);

  useEffect(() => {
    const handler = e => setIsCtrlActiveGlobal(e.detail);
    window.addEventListener("ctrl-toggle", handler);
    return () => window.removeEventListener("ctrl-toggle", handler);
  }, []);

  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    const handleBeforeInput = (e) => {
      if (!isCtrlActiveGlobal) return;
      e.preventDefault();
      const c = e.data?.toLowerCase();
      if (!c) return;
      const event = new KeyboardEvent("keydown", { key: c, code: c, ctrlKey: true, bubbles: true, cancelable: true });
      el.dispatchEvent(event);
      window.dispatchEvent(event);
      setIsCtrlActiveGlobal(false);
    };
    el.addEventListener("beforeinput", handleBeforeInput);
    return () => el.removeEventListener("beforeinput", handleBeforeInput);
  }, [isCtrlActiveGlobal]);

  useEffect(() => {
    if (startLoggedIn) {
      setHistory([
        { text: "Thanks for attending this workshop by HIMA TRPL" },
        { text: "Welcome back to Debian GNU/Linux 12 (bookworm)!" }
      ]);
      setIsBooting(false);
      return;
    } else {
      setHistory([
        { text: "Thanks for attending this workshop by HIMA TRPL" },
        { text: "Welcome to Debian GNU/Linux 12 (bookworm)!" },
        { text: "debian login: ", prompt: true, type: "login" }
      ]);
      setIsBooting(false);
    }
  }, [startLoggedIn]);

  useEffect(() => {
    if (loggedIn && !isFsLoaded) {
      const fsKey = `${FILESYSTEM_KEY_PREFIX}${userData.username || "user"}`;
      const savedFs = localStorage.getItem(fsKey);
      if (savedFs) setFileSystem(JSON.parse(savedFs));
      else setFileSystem(createFileSystem(userData));
      setCurrentDir(homeDir);
      setUserPrompt(initialPrompt);
      setIsFsLoaded(true);
    }
  }, [loggedIn, isFsLoaded, userData, homeDir, initialPrompt]);

  useEffect(() => {
    if (loggedIn && isFsLoaded && fileSystem) {
      const fsKey = `${FILESYSTEM_KEY_PREFIX}${userData.username || "user"}`;
      localStorage.setItem(fsKey, JSON.stringify(fileSystem));
    }
  }, [fileSystem, loggedIn, isFsLoaded, userData.username]);

  useEffect(() => {
    if (isFsLoaded && loggedIn && !isAnimating) {
      if (history.length === 0 || !history[history.length - 1].prompt) {
        setHistory(prev => [...prev, { text: userPrompt, prompt: true, type: "command" }]);
      }
    }
  }, [isFsLoaded, loggedIn, userPrompt, history, isAnimating]);

  useEffect(() => {
    if (!isBooting && inputRef.current) inputRef.current.focus();
  }, [isBooting, editorState, isFsLoaded]);

  useEffect(() => {
    if (terminalRef.current) terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
  }, [history]);

  const runAnimatedCommand = (lines, finalPrompt) => {
    setIsAnimating(true);
    let i = 0;
    const interval = setInterval(() => {
      if (i < lines.length) {
        setHistory(prev => [...prev, { text: lines[i] }]);
        i++;
      } else {
        clearInterval(interval);
        setIsAnimating(false);
        setHistory(prev => [...prev, { text: finalPrompt, prompt: true, type: "command" }]);
      }
    }, 50);
  };

  const handleInput = (e) => {
    if (isAnimating) return;
    switch (e.key) {
      case "Enter": {
        e.preventDefault();
        const t = input.trim();
        if (t !== "") setCommandHistory(prev => [...prev, t]);
        setHistoryIndex(-1);
        const last = history[history.length - 1];
        let newHistory = [...history];
        const [cmd, ...args] = t.split(" ");
        if (loggedIn) {
          if (!isFsLoaded) return;
          newHistory[newHistory.length - 1] = { text: `${userPrompt}${input}` };
          const hasCompleted = localStorage.getItem(CHALLENGE_KEY) === "true";
          const isForce = args.includes("--force");
          if (cmd === "chall" && hasCompleted && !isForce) {
            newHistory.push({ text: "You finished this chall! If u need play again add --force." });
            newHistory.push({ text: "ex: chall --force" });
            newHistory.push({ text: userPrompt, prompt: true, type: "command" });
            setHistory(newHistory);
            setInput("");
            return;
          }
          if (cmd === "chall" && isForce) localStorage.removeItem(CHALLENGE_KEY);
          const state = { fileSystem, currentDir, homeDir, userData, userPrompt };
          const result = processCommand(cmd, args, state);
          if (result.reboot) {
            setLoggedIn(false);
            setFileSystem(null);
            setIsFsLoaded(false);
            newHistory.push({ text: "reboot: System is rebooting..." });
            setHistory(newHistory);
            setInput("");
            setTimeout(() => {
              setHistory(prev => [...prev, { text: " " }, { text: "Welcome to Debian GNU/Linux 12 (bookworm)!" }, { text: "debian login: ", prompt: true, type: "login" }]);
            }, 1500);
            window.location.reload();
            return;
          }
          if (result.fullReset) {
            onFullReset();
            return;
          }
          if (result.linesToAnimate && result.linesToAnimate.length > 0) {
            setHistory(newHistory);
            setInput("");
            runAnimatedCommand(result.linesToAnimate, result.userPrompt);
            setFileSystem(result.fileSystem);
            return;
          }
          if (result.history.length > 0) {
            result.history.forEach(line => newHistory.push(typeof line === "string" ? { text: line } : line));
          }
          setFileSystem(result.fileSystem);
          setCurrentDir(result.currentDir);
          setUserPrompt(result.userPrompt);
          if (result.startChallenge) {
            setIsChallengeMode(true);
            localStorage.removeItem(CHALLENGE_KEY);
            setChallengeTasks(getInitialChallengeTasks(homeDir));
          }
          const p = checkChallengeProgress(challengeTasks, result.fileSystem, result.currentDir, homeDir);
          setChallengeTasks(p.newTasks);
          if (p.justCompleted) {
            newHistory.push({ text: "----------------------------------------" });
            newHistory.push({ text: "🎉 CHALLENGE COMPLETE! Great job! 🎉" });
            newHistory.push({ text: "----------------------------------------" });
            localStorage.setItem(CHALLENGE_KEY, "true");
            setIsChallengeMode(false);
            setChallengeTasks(getInitialChallengeTasks(homeDir));
          }
          if (result.clear) {
            setHistory([{ text: result.userPrompt, prompt: true, type: "command" }]);
            setInput("");
            return;
          }
          if (result.exit) {
            setLoggedIn(false);
            setFileSystem(null);
            setIsFsLoaded(false);
            setIsTerminated(true);
            const lines = [
              { text: "[  OK  ] User session ended." },
              { text: "Connection to debian closed." },
              { text: " " },
              { text: "This project was made by Dzadafa and Danipion under HIMA TRPL." },
              { text: "[ Process terminated. Refresh the page to restart. ]", type: "terminated" }
            ];
            const print = (i) => {
              if (i >= lines.length) return;
              setTimeout(() => {
                setHistory(prev => [...prev, lines[i]]);
                print(i + 1);
              }, EXIT_DELAY_MS);
            };
            print(0);
            setHistory(newHistory);
            setInput("");
            return;
          }
          if (result.editorState) {
            setEditorState(result.editorState);
            setHistory(newHistory);
            setInput("");
            return;
          }
          newHistory.push({ text: result.userPrompt, prompt: true, type: "command" });
        } else {
          newHistory[newHistory.length - 1] = { text: `${loginPrompt}${input}` };
          if (input === userData.username) {
            setLoggedIn(true);
            newHistory = [newHistory[newHistory.length - 1], { text: `Welcome, ${userData.username}!` }];
          } else {
            newHistory.push({ text: "Login incorrect" });
            newHistory.push({ text: loginPrompt, prompt: true, type: "login" });
          }
        }
        setHistory(newHistory);
        setInput("");
        break;
      }
      case "ArrowUp": {
        e.preventDefault();
        if (commandHistory.length > 0) {
          let index = historyIndex === -1 ? commandHistory.length - 1 : Math.max(0, historyIndex - 1);
          setHistoryIndex(index);
          setInput(commandHistory[index]);
        }
        break;
      }
      case "ArrowDown": {
        e.preventDefault();
        if (historyIndex !== -1) {
          if (historyIndex === commandHistory.length - 1) {
            setHistoryIndex(-1);
            setInput("");
          } else {
            const index = historyIndex + 1;
            setHistoryIndex(index);
            setInput(commandHistory[index]);
          }
        }
        break;
      }
      case "Tab": {
        e.preventDefault();
        if (!loggedIn) break;
        const all = ["ls","cd","pwd","mkdir","touch","cp","mv","rm","rmdir","nano","vi","cat","less","chmod","chown","apt","help","clear","exit","reboot","deploy-portfolio"];
        const parts = input.split(" ");
        const last = parts[parts.length - 1];
        const isCmd = parts.length === 1;
        let list = [];
        let prefix = "";
        let partial = last;
        if (isCmd) list = all;
        else {
          prefix = last.substring(0, last.lastIndexOf("/") + 1);
          partial = last.substring(last.lastIndexOf("/") + 1);
          const target = resolvePath(currentDir, prefix || ".");
          const node = getDirNode(target, fileSystem);
          if (node && typeof node === "object") list = Object.keys(node);
        }
        const matches = list.filter(i => i.startsWith(partial));
        if (matches.length === 1) {
          parts[parts.length - 1] = prefix + matches[0];
          const nodePath = resolvePath(currentDir, prefix + matches[0]);
          const node = getDirNode(nodePath, fileSystem);
          if (node && typeof node === "object") setInput(parts.join(" ") + "/");
          else setInput(parts.join(" ") + " ");
        } else if (matches.length > 1) {
          let newHistory = [...history];
          newHistory[newHistory.length - 1] = { text: `${userPrompt}${input}` };
          newHistory.push({ text: matches.join("  ") });
          newHistory.push({ text: userPrompt, prompt: true, type: "command" });
          setHistory(newHistory);
        }
        break;
      }
      default:
        break;
    }
  };

  const handleEditorExit = (content) => {
    const path = editorState.filePath;
    const newFs = setFsNode(fileSystem, path, content);
    setFileSystem(newFs);
    const env = "/var/www/html/.env";
    let newHistory = [...history, { text: `File "${path}" saved.` }];
    const p = checkChallengeProgress(challengeTasks, newFs, currentDir, homeDir);
    setChallengeTasks(p.newTasks);
    if (p.justCompleted) {
      newHistory.push({ text: "----------------------------------------" });
      newHistory.push({ text: "🎉 CHALLENGE COMPLETE! Great job! 🎉" });
      newHistory.push({ text: "----------------------------------------" });
      localStorage.setItem(CHALLENGE_KEY, "true");
      setIsChallengeMode(false);
      setChallengeTasks(getInitialChallengeTasks(homeDir));
    }
    if (editorState.filePath === env) newHistory.push({ text: "Hint: Run 'deploy-portfolio' to publish your changes." });
    newHistory.push({ text: userPrompt, prompt: true, type: "command" });
    setHistory(newHistory);
    setEditorState({ mode: "none", filePath: "", content: "" });
  };

  const focusInput = () => {
    const sel = window.getSelection();
    if (sel.type === "Range") return;
    if (!isBooting && inputRef.current) inputRef.current.focus();
  };

  if (editorState.mode !== "none") {
    return <Editor mode={editorState.mode} filePath={editorState.filePath} initialContent={editorState.content} onExit={handleEditorExit} />;
  }

  const lastLine = history.length > 0 ? history[history.length - 1] : {};
  const showInline = !isTerminated && !isAnimating && !isBooting && lastLine.prompt && (lastLine.type === "command" || lastLine.type === "login");

  return (
    <>
      {isChallengeMode && (
        <div className="challenge-card">
          <h4>Workshop Challenge</h4>
          <ul className="challenge-list">
            {challengeTasks.map(task => (
              <li key={task.id} className={`task-item ${task.completed ? "completed" : ""}`}>{task.text}</li>
            ))}
          </ul>
        </div>
      )}
      <div ref={terminalRef} onClick={focusInput} className="terminal-container">
        {history.map((line, i) => {
          const isLink = line.type === "link";
          return (
            <div key={i} className="terminal-history-line">
              {isLink ? (
                <a href={line.url} target="_blank" rel="noopener noreferrer" className="terminal-link">{line.text}</a>
              ) : (
                <pre className={line.type === "terminated" ? "terminated-text" : ""}>{line.text}</pre>
              )}
              {showInline && i === history.length - 1 && (
                <input
                  ref={inputRef}
                  type="text"
                  className="terminal-input"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleInput}
                  autoFocus
                  autoCapitalize="none"
                  autoComplete="off"
                  autoCorrect="off"
                  spellCheck="false"
                />
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}

export default Terminal;

