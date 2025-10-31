import { useState, useEffect, useRef } from 'react';
import { bootLines } from '../data/installData.js';
import Editor from './Editor.jsx';

const BOOT_DELAY_MS = 120;

const createFileSystem = (userData) => ({
  '/': {
    'home': {
      [userData.username || 'user']: {
        'Documents': {},
        'Downloads': {},
        'README.txt': "Welcome!"
      }
    },
    'etc': {
      'hostname': userData.hostname || 'debian',
      'hosts': "127.0.0.1 localhost"
    },
    'root': {
      '.bashrc': "..."
    },
    'var': { 
      'log': {
        'syslog': "system log"
      } 
    }
  }
});

const normalizePath = (path) => {
  return '/' + path.split('/').filter(p => p).join('/') || '/';
};

const resolvePath = (current, target) => {
  if (!target) return current;
  if (target.startsWith('/')) {
    return normalizePath(target);
  }
  
  let parts = current.split('/').filter(p => p);
  const targetParts = target.split('/').filter(p => p);

  for (const part of targetParts) {
    if (part === '..') {
      if (parts.length > 0) {
        parts.pop();
      }
    } else if (part !== '.') {
      parts.push(part);
    }
  }
  return '/' + parts.join('/') || '/';
};

const getDirNode = (path, fs) => {
  const parts = path.split('/').filter(p => p);
  let node = fs['/'];
  try {
    for (const part of parts) {
      if (node[part] === undefined) return null;
      node = node[part];
    }
    return node;
  } catch (e) {
    return null;
  }
};

const getParentNode = (path, fs) => {
  const parts = path.split('/').filter(p => p);
  parts.pop();
  let node = fs['/'];
  for (const part of parts) {
    node = node[part];
  }
  return node;
};

const setFsNode = (fs, path, value) => {
  const parts = path.split('/').filter(p => p);
  const fileName = parts.pop();
  
  let newFs = { ...fs };
  let node = newFs['/'];

  for (const part of parts) {
    const newNode = { ...node[part] };
    node[part] = newNode;
    node = newNode;
  }

  node[fileName] = value;
  return newFs;
};

const deleteFsNode = (fs, path) => {
  const parts = path.split('/').filter(p => p);
  const nodeName = parts.pop();
  
  let newFs = { ...fs };
  let node = newFs['/'];

  for (const part of parts) {
    const newNode = { ...node[part] };
    node[part] = newNode;
    node = newNode;
  }

  delete node[nodeName];
  return newFs;
};


function Terminal({ userData }) {
  const [history, setHistory] = useState([]);
  const [input, setInput] = useState('');
  const [loggedIn, setLoggedIn] = useState(false);
  const [isBooting, setIsBooting] = useState(true);
  const [fileSystem, setFileSystem] = useState(null);
  const [currentDir, setCurrentDir] = useState('/');
  const [editorState, setEditorState] = useState({ mode: 'none', filePath: '', content: '' });
  
  const homeDir = `/home/${userData.username || 'user'}`;
  const initialPrompt = `${userData.username || 'user'}@${userData.hostname || 'debian'}:~$ `;
  const [userPrompt, setUserPrompt] = useState(initialPrompt);

  const inputRef = useRef(null);
  const terminalRef = useRef(null);
  const loginPrompt = "debian login: ";

  useEffect(() => {
    let lineIndex = 0;
    const interval = setInterval(() => {
      if (lineIndex < bootLines.length) {
        setHistory(prev => [...prev, { text: bootLines[lineIndex] }]);
        lineIndex++;
      } else {
        clearInterval(interval);
        setHistory(prev => [
          ...prev,
          { text: "debian login: ", prompt: true, type: 'login' }
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
    if (e.key === 'Enter') {
      const lastLine = history[history.length - 1];
      let newHistory = [...history];
      
      const [command, ...args] = input.trim().split(' ');

      if (loggedIn) {
        newHistory[newHistory.length - 1] = { text: `${userPrompt}${input}` };
        
        switch (command) {
          case 'dir':
          case 'ls':
            const targetPath = args[0] ? resolvePath(currentDir, args[0]) : currentDir;
            const node = getDirNode(targetPath, fileSystem);
            if (node && typeof node === 'object') {
              const contents = Object.keys(node);
              if (contents.length > 0) {
                newHistory.push({ text: contents.join('  ') });
              }
            } else {
              newHistory.push({ text: `ls: cannot access '${args[0] || ''}': No such file or directory` });
            }
            break;
          
          case 'cd':
            const targetDir = args[0] ? resolvePath(currentDir, args[0]) : homeDir;
            const dirNode = getDirNode(targetDir, fileSystem);
            
            if (dirNode && typeof dirNode === 'object') {
              setCurrentDir(targetDir);
              const newPrompt = `${userData.username || 'user'}@${userData.hostname || 'debian'}:${targetDir.replace(homeDir, '~')}$ `;
              setUserPrompt(newPrompt);
              newHistory.push({ text: newPrompt, prompt: true, type: 'command' });
              setInput('');
              setHistory(newHistory);
              return;
            } else {
              newHistory.push({ text: `bash: cd: ${args[0]}: No such file or directory` });
            }
            break;
            
          case 'clear':
            setHistory([{ text: userPrompt, prompt: true, type: 'command' }]);
            setInput('');
            return;
            
          case 'exit':
            setLoggedIn(false);
            setCurrentDir('/');
            setFileSystem(null);
            setUserPrompt(initialPrompt);
            setHistory([
              { text: "Debian GNU/Linux 12 debian tty1" },
              { text: loginPrompt, prompt: true, type: 'login' }
            ]);
            setInput('');
            return;
            
          case 'mkdir':
            const dirName = args[0];
            if (!dirName) {
              newHistory.push({ text: `mkdir: missing operand` });
              break;
            }
            const newDirPath = resolvePath(currentDir, dirName);
            const parentPath = newDirPath.substring(0, newDirPath.lastIndexOf('/')) || '/';
            const newDirName = newDirPath.substring(newDirPath.lastIndexOf('/') + 1);
            
            const parentNode = getDirNode(parentPath, fileSystem);
            if (!parentNode || typeof parentNode === 'string') {
              newHistory.push({ text: `mkdir: cannot create directory ‘${dirName}’: No such file or directory` });
              break;
            }
            if (parentNode[newDirName]) {
              newHistory.push({ text: `mkdir: cannot create directory ‘${dirName}’: File exists` });
              break;
            }
            setFileSystem(setFsNode(fileSystem, newDirPath, {}));
            break;

          case 'touch':
            const fileName = args[0];
            if (!fileName) {
              newHistory.push({ text: `touch: missing file operand` });
              break;
            }
            const newFilePath = resolvePath(currentDir, fileName);
            const fileParentPath = newFilePath.substring(0, newFilePath.lastIndexOf('/')) || '/';
            const newFileName = newFilePath.substring(newFilePath.lastIndexOf('/') + 1);
            
            const fileParentNode = getDirNode(fileParentPath, fileSystem);
            if (!fileParentNode || typeof fileParentNode === 'string') {
              newHistory.push({ text: `touch: cannot touch ‘${fileName}’: No such file or directory` });
              break;
            }
            if (fileParentNode[newFileName] === undefined) {
              setFileSystem(setFsNode(fileSystem, newFilePath, ""));
            }
            break;

          case 'nano':
          case 'vi':
            const filePath = args[0] ? resolvePath(currentDir, args[0]) : null;
            if (!filePath) {
              newHistory.push({ text: `${command}: missing file operand` });
              break;
            }
            
            const fileNode = getDirNode(filePath, fileSystem);
            if (fileNode && typeof fileNode === 'object') {
              newHistory.push({ text: `bash: ${command}: ${args[0]}: Is a directory` });
              break;
            }
            
            const fileContent = (fileNode && typeof fileNode === 'string') ? fileNode : "";
            setEditorState({ mode: command, filePath: filePath, content: fileContent });
            return;

          case 'cat':
            const catPath = args[0] ? resolvePath(currentDir, args[0]) : null;
            if (!catPath) {
                newHistory.push({ text: `cat: missing file operand` });
                break;
            }
            const catNode = getDirNode(catPath, fileSystem);
            if (catNode === null) {
                newHistory.push({ text: `cat: ${args[0]}: No such file or directory` });
            } else if (typeof catNode === 'object') {
                newHistory.push({ text: `cat: ${args[0]}: Is a directory` });
            } else {
                newHistory.push({ text: catNode });
            }
            break;

          case 'rm':
            const rmPath = args[0] ? resolvePath(currentDir, args[0]) : null;
            if (!rmPath) {
                newHistory.push({ text: `rm: missing operand` });
                break;
            }
            const rmNode = getDirNode(rmPath, fileSystem);
            if (rmNode === null) {
                newHistory.push({ text: `rm: cannot remove '${args[0]}': No such file or directory` });
            } else if (typeof rmNode === 'object') {
                newHistory.push({ text: `rm: cannot remove '${args[0]}': Is a directory` });
            } else {
                setFileSystem(deleteFsNode(fileSystem, rmPath));
            }
            break;

          case 'rmdir':
            const rmdirPath = args[0] ? resolvePath(currentDir, args[0]) : null;
            if (!rmdirPath) {
                newHistory.push({ text: `rmdir: missing operand` });
                break;
            }
            const rmdirNode = getDirNode(rmdirPath, fileSystem);
            if (rmdirNode === null) {
                newHistory.push({ text: `rmdir: failed to remove '${args[0]}': No such file or directory` });
            } else if (typeof rmdirNode === 'string') {
                newHistory.push({ text: `rmdir: failed to remove '${args[0]}': Not a directory` });
            } else if (Object.keys(rmdirNode).length > 0) {
                newHistory.push({ text: `rmdir: failed to remove '${args[0]}': Directory not empty` });
            } else {
                setFileSystem(deleteFsNode(fileSystem, rmdirPath));
            }
            break;
            
          case '':
            break;

          default:
            newHistory.push({ text: `bash: command not found: ${command}` });
        }
        
        newHistory.push({ text: userPrompt, prompt: true, type: 'command' });

      } else {
        newHistory[newHistory.length - 1] = { text: `${loginPrompt}${input}` };
        if (input === userData.username) {
          const newFs = createFileSystem(userData);
          setFileSystem(newFs);
          setCurrentDir(homeDir);
          setUserPrompt(initialPrompt);
          newHistory.push({ text: `Welcome, ${userData.username}!` });
          newHistory.push({ text: userPrompt, prompt: true, type: 'command' });
          setLoggedIn(true);
        } else {
          newHistory.push({ text: "Login incorrect" });
          newHistory.push({ text: loginPrompt, prompt: true, type: 'login' });
        }
      }
      
      setHistory(newHistory);
      setInput('');
    }
  };

  const handleEditorExit = (newContent) => {
    const { filePath } = editorState;
    setFileSystem(setFsNode(fileSystem, filePath, newContent));
    
    setHistory(prev => [
        ...prev,
        { text: `File "${filePath}" saved.` },
        { text: userPrompt, prompt: true, type: 'command' }
    ]);
    setEditorState({ mode: 'none', filePath: '', content: '' });
  };

  const focusInput = () => {
    const selection = window.getSelection();
    if (selection.type === 'Range') {
      return;
    }
    if (!isBooting && inputRef.current) {
      inputRef.current.focus();
    }
  };

  if (editorState.mode !== 'none') {
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
  const showInlineInput = lastLine.prompt && (lastLine.type === 'command' || lastLine.type === 'login');

  return (
    <div 
      ref={terminalRef} 
      onClick={focusInput} 
      style={{ width: '100%', height: '95vh', overflowY: 'auto' }}
      className="terminal-container"
    >
      {history.map((line, index) => (
        <div key={index} style={{ display: 'flex' }}>
          <pre>
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
            />
          )}
        </div>
      ))}
    </div>
  );
}

export default Terminal;
