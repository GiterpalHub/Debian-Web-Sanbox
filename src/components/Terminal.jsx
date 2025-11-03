import { useState, useEffect, useRef } from "react";
import { fullBootLines } from "../data/installData.js";
import Editor from "./Editor.jsx";
import {
  processCommand,
  setFsNode,
  getDirNode,
  resolvePath,
} from "../utils/commandLogic.js";

const BOOT_DELAY_MS = 120;
const EXIT_DELAY_MS = BOOT_DELAY_MS * 2;

const createFileSystem = (userData) => ({
  "/": {
    home: {
      [userData.username || "user"]: {
        Documents: {},
        Downloads: {},
        "README.txt": "Welcome to your new Debian server!",
        "script.sh": "#!/bin/bash\necho 'Hello world'",
        "catatan.txt": "",
      },
    },
    etc: {
      hostname: userData.hostname || "debian",
      hosts: "127.0.0.1 localhost",
    },
    root: {
      ".bashrc": "...",
    },
    var: {
      log: {
        syslog: "system log [timestamp]...",
        nginx: {
          "error.log":
            "2025/11/03 06:30:00 [error] 123#123: *1 connect() failed (111: Connection refused) while connecting to upstream...",
        },
      },
    },
    tmp: {
      "penting.txt": "This is a very important file.",
    },
  },
});

function Terminal({ userData, skipBoot = false }) {
  const [history, setHistory] = useState([]);
  const [input, setInput] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);
  const [isBooting, setIsBooting] = useState(true);
  const [isTerminated, setIsTerminated] = useState(false);
  const [fileSystem, setFileSystem] = useState(null);
  const [currentDir, setCurrentDir] = useState("/");
  const [editorState, setEditorState] = useState({
    mode: "none",
    filePath: "",
    content: "",
  });

  const [commandHistory, setCommandHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const homeDir = `/home/${userData.username || "user"}`;
  const initialPrompt = `${userData.username || "user"}@${
    userData.hostname || "debian"
  }:~$ `;
  const [userPrompt, setUserPrompt] = useState(initialPrompt);

  const inputRef = useRef(null);
  const terminalRef = useRef(null);
  const loginPrompt = "debian login: ";

  useEffect(() => {
    if (skipBoot) {
      setHistory([
        { text: "Thanks for attending this workshop by HIMA TRPL" },
        { text: "Welcome to Debian GNU/Linux 12 (bookworm)!" },
        { text: "debian login: ", prompt: true, type: "login" },
      ]);
      setIsBooting(false);
      return;
    }

    let lineIndex = 0;
    const interval = setInterval(() => {
      if (lineIndex < fullBootLines.length) {
        setHistory((prev) => [...prev, { text: fullBootLines[lineIndex] }]);
        lineIndex++;
      } else {
        clearInterval(interval);
        setHistory((prev) => [
          ...prev,
          { text: "Thanks for attending this workshop by HIMA TRPL" },
          { text: "Welcome to Debian GNU/Linux 12 (bookworm)!" },
          { text: "debian login: ", prompt: true, type: "login" },
        ]);
        setIsBooting(false);
      }
    }, BOOT_DELAY_MS);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!isBooting && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isBooting, editorState]);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [history]);

  const handleInput = (e) => {
    switch (e.key) {
      case "Enter": {
        e.preventDefault();

        const trimmedInput = input.trim();
        if (trimmedInput !== "") {
          setCommandHistory((prev) => [...prev, trimmedInput]);
        }
        setHistoryIndex(-1);

        const lastLine = history[history.length - 1];
        let newHistory = [...history];

        const [command, ...args] = trimmedInput.split(" ");

        if (loggedIn) {
          newHistory[newHistory.length - 1] = { text: `${userPrompt}${input}` };

          const currentState = {
            fileSystem: fileSystem,
            currentDir: currentDir,
            homeDir: homeDir,
            userData: userData,
            userPrompt: userPrompt,
          };

          const result = processCommand(command, args, currentState);

          if (result.history.length > 0) {
            result.history.forEach((line) => newHistory.push({ text: line }));
          }
          setFileSystem(result.fileSystem);
          setCurrentDir(result.currentDir);
          setUserPrompt(result.userPrompt);

          if (result.clear) {
            setHistory([
              { text: result.userPrompt, prompt: true, type: "command" },
            ]);
            setInput("");
            return;
          }

          if (result.exit) {
            setLoggedIn(false);
            setIsTerminated(true);
            const creditLines = [
              { text: "[  OK  ] User session ended." },
              { text: "Connection to debian closed." },
              { text: " " },
              {
                text: "This project was made by Dzadafa and Danipion under HIMA TRPL.",
              },
              {
                text: "[ Process terminated. Refresh the page to restart. ]",
                type: "terminated",
              },
            ];
            const printCreditLines = (index) => {
              if (index >= creditLines.length) return;
              setTimeout(() => {
                setHistory((prev) => [...prev, creditLines[index]]);
                printCreditLines(index + 1);
              }, EXIT_DELAY_MS);
            };
            printCreditLines(0);
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

          newHistory.push({
            text: result.userPrompt,
            prompt: true,
            type: "command",
          });
        } else {
          newHistory[newHistory.length - 1] = {
            text: `${loginPrompt}${input}`,
          };
          if (input === userData.username) {
            const newFs = createFileSystem(userData);
            setFileSystem(newFs);
            setCurrentDir(homeDir);
            setUserPrompt(initialPrompt);

            newHistory = [
              newHistory[newHistory.length - 1],
              { text: `Welcome, ${userData.username}!` },
              { text: userPrompt, prompt: true, type: "command" },
            ];

            setLoggedIn(true);
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
          let newIndex;
          if (historyIndex === -1) {
            newIndex = commandHistory.length - 1;
          } else {
            newIndex = Math.max(0, historyIndex - 1);
          }
          setHistoryIndex(newIndex);
          setInput(commandHistory[newIndex]);
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
            const newIndex = historyIndex + 1;
            setHistoryIndex(newIndex);
            setInput(commandHistory[newIndex]);
          }
        }
        break;
      }

      case "Tab": {
        e.preventDefault();
        if (!loggedIn) break;

        const allCommands = [
          "ls",
          "cd",
          "pwd",
          "mkdir",
          "touch",
          "cp",
          "mv",
          "rm",
          "rmdir",
          "nano",
          "vi",
          "cat",
          "less",
          "chmod",
          "chown",
          "apt",
          "help",
          "clear",
          "exit",
        ];

        const parts = input.split(" ");
        const currentWord = parts[parts.length - 1];
        const isCommand = parts.length === 1;

        let possibilities = [];
        let prefix = "";
        let partial = currentWord;

        if (isCommand) {
          possibilities = allCommands;
        } else {
          prefix = currentWord.substring(0, currentWord.lastIndexOf("/") + 1);
          partial = currentWord.substring(currentWord.lastIndexOf("/") + 1);

          const targetDir = resolvePath(currentDir, prefix || ".");
          const dirNode = getDirNode(targetDir, fileSystem);

          if (dirNode && typeof dirNode === "object") {
            possibilities = Object.keys(dirNode);
          }
        }

        const matches = possibilities.filter((item) =>
          item.startsWith(partial)
        );

        if (matches.length === 1) {
          const match = matches[0];
          parts[parts.length - 1] = prefix + match;

          const nodePath = resolvePath(currentDir, prefix + match);
          const node = getDirNode(nodePath, fileSystem);
          if (node && typeof node === "object") {
            setInput(parts.join(" ") + "/");
          } else {
            setInput(parts.join(" ") + " ");
          }
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

  const handleEditorExit = (newContent) => {
    const { filePath } = editorState;
    setFileSystem(setFsNode(fileSystem, filePath, newContent));

    setHistory((prev) => [
      ...prev,
      { text: `File "${filePath}" saved.` },
      { text: userPrompt, prompt: true, type: "command" },
    ]);
    setEditorState({ mode: "none", filePath: "", content: "" });
  };

  const focusInput = () => {
    const selection = window.getSelection();
    if (selection.type === "Range") {
      return;
    }
    if (!isBooting && inputRef.current) {
      inputRef.current.focus();
    }
  };

  if (editorState.mode !== "none") {
    return (
      <Editor
        mode={editorState.mode}
        filePath={editorState.filePath}
        initialContent={editorState.content}
        onExit={handleEditorExit}
      />
    );
  }

  const lastLine = history.length > 0 ? history[history.length - 1] : {};
  const showInlineInput =
    !isTerminated &&
    lastLine.prompt &&
    (lastLine.type === "command" || lastLine.type === "login");

  return (
    <div ref={terminalRef} onClick={focusInput} className="terminal-container">
      {history.map((line, index) => (
        <div key={index} className="terminal-history-line">
          <pre className={line.type === "terminated" ? "terminated-text" : ""}>
            {line.text}
          </pre>
          {showInlineInput && index === history.length - 1 && (
            <input
              ref={inputRef}
              type="text"
              className="terminal-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleInput}
              autoFocus
              autoCapitalize="none"
              autoComplete="off"
              autoCorrect="off"
              spellCheck="false"
            />
          )}
        </div>
      ))}
    </div>
  );
}

export default Terminal;
