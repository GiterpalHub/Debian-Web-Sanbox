import { APPS_SCRIPT_URL } from "../data/environment.js";
import { fakeNginxInstallLogsWithPortfolio } from "../data/installData.js";
import {
  defaultEnv,
  templateHTML,
  templateCSS,
  templateJS,
} from "../data/portfolioTemplate.js";

export const normalizePath = (path) => {
  return (
    "/" +
      path
        .split("/")
        .filter((p) => p)
        .join("/") || "/"
  );
};

export const resolvePath = (current, target) => {
  if (!target) return current;
  if (target.startsWith("/")) {
    return normalizePath(target);
  }

  let parts = current.split("/").filter((p) => p);
  const targetParts = target.split("/").filter((p) => p);

  for (const part of targetParts) {
    if (part === "..") {
      if (parts.length > 0) {
        parts.pop();
      }
    } else if (part !== ".") {
      parts.push(part);
    }
  }
  return "/" + parts.join("/") || "/";
};

export const getDirNode = (path, fs) => {
  const parts = path.split("/").filter((p) => p);
  let node = fs["/"];
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

export const setFsNode = (fs, path, value) => {
  const parts = path.split("/").filter((p) => p);
  const fileName = parts.pop();

  if (!fileName) return fs;

  let newFs = { ...fs };
  let node = newFs["/"];

  for (const part of parts) {
    const newNode = node[part] ? { ...node[part] } : {};
    node[part] = newNode;
    node = newNode;
  }

  node[fileName] = value;
  return newFs;
};

export const deleteFsNode = (fs, path) => {
  const parts = path.split("/").filter((p) => p);
  const nodeName = parts.pop();

  if (path === "/") return fs;

  let newFs = { ...fs };
  let node = newFs["/"];

  for (const part of parts) {
    const newNode = { ...node[part] };
    node[part] = newNode;
    node = newNode;
  }

  delete node[nodeName];
  return newFs;
};

const getFileName = (path) => path.substring(path.lastIndexOf("/") + 1);

export const createFileSystem = (userData) => ({
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

const readOnlyPaths = [
  "/var/www/html/index.html",
  "/var/www/html/style.css",
  "/var/www/html/script.js",
];

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

export const processCommand = (command, args, state) => {
  let { fileSystem, currentDir, homeDir, userData, userPrompt } = state;

  let result = {
    history: [],
    fileSystem: fileSystem,
    currentDir: currentDir,
    userPrompt: userPrompt,
    editorState: null,
    clear: false,
    exit: false,
    startChallenge: false,
    deployment: null,
    linesToAnimate: null,
    reboot: false,
    fullReset: false,
  };

  switch (command) {
    case "pwd":
      result.history.push(currentDir);
      break;

    case "dir":
    case "ls": {
      const targetPath =
        args[0] && !args[0].startsWith("-")
          ? resolvePath(currentDir, args[0])
          : currentDir;
      const node = getDirNode(targetPath, fileSystem);

      if (!node || typeof node === "string") {
        result.history.push(
          `ls: cannot access '${args[0] || ""}': No such file or directory`
        );
        break;
      }

      const contents = Object.keys(node);
      if (args.includes("-la")) {
        result.history.push("total " + contents.length * 4);
        result.history.push("drwxr-xr-x 2 user user 4096 Nov 3 06:30 .");
        result.history.push("drwxr-xr-x 4 root root 4096 Nov 3 06:00 ..");
        contents.forEach((item) => {
          if (typeof node[item] === "object") {
            result.history.push(
              `drwxr-xr-x 2 user user 4096 Nov 3 06:30 ${item}`
            );
          } else {
            result.history.push(
              `-rw-r--r-- 1 user user  128 Nov 3 06:30 ${item}`
            );
          }
        });
      } else {
        if (contents.length > 0) {
          result.history.push(contents.join("  "));
        }
      }
      break;
    }

    case "cd": {
      const targetDir = args[0] ? resolvePath(currentDir, args[0]) : homeDir;
      const dirNode = getDirNode(targetDir, fileSystem);

      if (dirNode && typeof dirNode === "object") {
        result.currentDir = targetDir;
        result.userPrompt = `${userData.username || "user"}@${
          userData.hostname || "debian"
        }:${targetDir.replace(homeDir, "~")}$ `;
      } else if (dirNode && typeof dirNode === "string") {
        result.history.push(`bash: cd: ${args[0]}: Not a directory`);
      } else {
        result.history.push(`bash: cd: ${args[0]}: No such file or directory`);
      }
      break;
    }

    case "mkdir": {
      const dirName = args[0];
      if (!dirName) {
        result.history.push(`mkdir: missing operand`);
        break;
      }
      const newDirPath = resolvePath(currentDir, dirName);
      const parentPath =
        newDirPath.substring(0, newDirPath.lastIndexOf("/")) || "/";
      const newDirName = getFileName(newDirPath);

      const parentNode = getDirNode(parentPath, fileSystem);
      if (!parentNode || typeof parentNode === "string") {
        result.history.push(
          `mkdir: cannot create directory ‘${dirName}’: No such file or directory`
        );
        break;
      }
      if (parentNode[newDirName]) {
        result.history.push(
          `mkdir: cannot create directory ‘${dirName}’: File exists`
        );
        break;
      }
      result.fileSystem = setFsNode(fileSystem, newDirPath, {});
      break;
    }

    case "touch": {
      const fileName = args[0];
      if (!fileName) {
        result.history.push(`touch: missing file operand`);
        break;
      }
      const newFilePath = resolvePath(currentDir, fileName);
      const fileParentPath =
        newFilePath.substring(0, newFilePath.lastIndexOf("/")) || "/";
      const newFileName = getFileName(newFilePath);

      const fileParentNode = getDirNode(fileParentPath, fileSystem);
      if (!fileParentNode || typeof fileParentNode === "string") {
        result.history.push(
          `touch: cannot touch ‘${fileName}’: No such file or directory`
        );
        break;
      }
      if (fileParentNode[newFileName] === undefined) {
        result.fileSystem = setFsNode(fileSystem, newFilePath, "");
      }

      break;
    }

    case "cp": {
      const source = args[0];
      const dest = args[1];
      if (!source || !dest) {
        result.history.push(`cp: missing file operand`);
        break;
      }

      const sourcePath = resolvePath(currentDir, source);
      let destPath = resolvePath(currentDir, dest);

      const sourceNode = getDirNode(sourcePath, fileSystem);
      if (sourceNode === null) {
        result.history.push(
          `cp: cannot stat '${source}': No such file or directory`
        );
        break;
      }
      if (typeof sourceNode === "object") {
        result.history.push(
          `cp: -r not specified; omitting directory '${source}'`
        );
        break;
      }

      const destNode = getDirNode(destPath, fileSystem);
      if (destNode && typeof destNode === "object") {
        destPath = `${destPath}/${getFileName(sourcePath)}`;
      }

      result.fileSystem = setFsNode(fileSystem, destPath, sourceNode);
      break;
    }

    case "mv": {
      const source = args[0];
      const dest = args[1];
      if (!source || !dest) {
        result.history.push(`mv: missing file operand`);
        break;
      }

      const sourcePath = resolvePath(currentDir, source);
      let destPath = resolvePath(currentDir, dest);

      const sourceNode = getDirNode(sourcePath, fileSystem);
      if (sourceNode === null) {
        result.history.push(
          `mv: cannot stat '${source}': No such file or directory`
        );
        break;
      }

      const destNode = getDirNode(destPath, fileSystem);
      if (destNode && typeof destNode === "object") {
        destPath = `${destPath}/${getFileName(sourcePath)}`;
      }

      let newFs = setFsNode(fileSystem, destPath, sourceNode);
      result.fileSystem = deleteFsNode(newFs, sourcePath);
      break;
    }

    case "rm": {
      const rmPath = args[0] ? resolvePath(currentDir, args[0]) : null;

      if (args.includes("-rf")) {
        result.history.push(`rm: deleting ${rmPath} recursively...`);
        result.history.push(`rm: system reset initiated.`);
        result.fullReset = true;
        break;
      }

      if (readOnlyPaths.includes(rmPath)) {
        result.history.push(
          `rm: cannot remove '${args[0]}': Permission denied (read-only file)`
        );
        break;
      }

      if (!rmPath) {
        result.history.push(`rm: missing operand`);
        break;
      }
      const rmNode = getDirNode(rmPath, fileSystem);
      if (rmNode === null) {
        result.history.push(
          `rm: cannot remove '${args[0]}': No such file or directory`
        );
      } else if (typeof rmNode === "object") {
        result.history.push(`rm: cannot remove '${args[0]}': Is a directory`);
      } else {
        result.fileSystem = deleteFsNode(fileSystem, rmPath);
      }
      break;
    }

    case "rmdir": {
      const rmdirPath = args[0] ? resolvePath(currentDir, args[0]) : null;
      if (!rmdirPath) {
        result.history.push(`rmdir: missing operand`);
        break;
      }
      const rmdirNode = getDirNode(rmdirPath, fileSystem);
      if (rmdirNode === null) {
        result.history.push(
          `rmdir: failed to remove '${args[0]}': No such file or directory`
        );
      } else if (typeof rmdirNode === "string") {
        result.history.push(
          `rmdir: failed to remove '${args[0]}': Not a directory`
        );
      } else if (Object.keys(rmdirNode).length > 0) {
        result.history.push(
          `rmdir: failed to remove '${args[0]}': Directory not empty`
        );
      } else {
        result.fileSystem = deleteFsNode(fileSystem, rmdirPath);
      }
      break;
    }

    case "nano":
    case "vi": {
      const filePath = args[0] ? resolvePath(currentDir, args[0]) : null;

      if (readOnlyPaths.includes(filePath)) {
        result.history.push(
          `bash: ${command}: ${args[0]}: Permission denied (read-only file)`
        );
        break;
      }

      if (!filePath) {
        result.history.push(`${command}: missing file operand`);
        break;
      }

      const fileNode = getDirNode(filePath, fileSystem);
      if (fileNode && typeof fileNode === "object") {
        result.history.push(`bash: ${command}: ${args[0]}: Is a directory`);
        break;
      }

      const fileContent =
        fileNode && typeof fileNode === "string" ? fileNode : "";
      result.editorState = {
        mode: command,
        filePath: filePath,
        content: fileContent,
      };
      break;
    }

    case "cat":
    case "less": {
      const catPath = args[0] ? resolvePath(currentDir, args[0]) : null;
      if (!catPath) {
        result.history.push(`${command}: missing file operand`);
        break;
      }
      const catNode = getDirNode(catPath, fileSystem);
      if (catNode === null) {
        result.history.push(
          `${command}: ${args[0]}: No such file or directory`
        );
      } else if (typeof catNode === "object") {
        result.history.push(`${command}: ${args[0]}: Is a directory`);
      } else {
        const lines = catNode.split("\n");
        lines.forEach((line) => result.history.push(line));
      }
      break;
    }

    case "chmod": {
      const perms = args[0];
      const file = args[1];
      if (!perms || !file) {
        result.history.push(`chmod: missing operand`);
        break;
      }

      const filePath = resolvePath(currentDir, file);
      const node = getDirNode(filePath, fileSystem);
      if (node === null) {
        result.history.push(
          `chmod: cannot access '${file}': No such file or directory`
        );
      } else {
      }
      break;
    }

    case "chown": {
      const owner = args[0];
      const file = args[1];
      if (!owner || !file) {
        result.history.push(`chown: missing operand`);
        break;
      }
      const filePath = resolvePath(currentDir, file);
      const node = getDirNode(filePath, fileSystem);
      if (node === null) {
        result.history.push(
          `chown: cannot access '${file}': No such file or directory`
        );
      } else {
      }
      break;
    }

    case "apt": {
      const subCommand = args[0];
      if (subCommand === "update") {
        result.history.push(
          "Hit:1 http://deb.debian.org/debian bookworm InRelease"
        );
        result.history.push(
          "Hit:2 http://deb.debian.org/debian bookworm-updates InRelease"
        );
        result.history.push(
          "Hit:3 http://deb.debian.org/debian-security bookworm-security InRelease"
        );
        result.history.push("Reading package lists... Done");
      } else if (subCommand === "install") {
        const pkg = args[1];
        if (pkg === "nginx") {
          result.linesToAnimate = fakeNginxInstallLogsWithPortfolio;

          let newFs = setFsNode(fileSystem, "/etc/nginx", {});
          newFs = setFsNode(
            newFs,
            "/etc/nginx/nginx.conf",
            "user www-data;\nworker_processes auto;"
          );
          newFs = setFsNode(newFs, "/var/www/html", {});
          newFs = setFsNode(newFs, "/var/www/html/.env", defaultEnv);
          newFs = setFsNode(newFs, "/var/www/html/index.html", templateHTML);
          newFs = setFsNode(newFs, "/var/www/html/style.css", templateCSS);
          newFs = setFsNode(newFs, "/var/www/html/script.js", templateJS);
          result.fileSystem = newFs;
        } else if (pkg) {
          result.history.push("Reading package lists... Done");
          result.history.push("Building dependency tree... Done");
          result.history.push(`E: Unable to locate package ${pkg}`);
        } else {
          result.history.push("apt install <pkg> (try 'nginx')");
        }
      } else {
        result.history.push("apt <command> [options]");
        result.history.push("Commands: update, install");
      }
      break;
    }

    case "deploy-portfolio": {
      const envPath = "/var/www/html/.env";
      const envNode = getDirNode(envPath, fileSystem);

      if (envNode === null || typeof envNode !== "string") {
        result.history.push(
          "deploy-portfolio: ERROR: /var/www/html/.env not found."
        );
        result.history.push("Hint: Have you run 'apt install nginx' yet?");
        break;
      }

      const envData = parseEnv(envNode);
      const name = envData.NAME || userData.username || "user";
      const slug = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

      if (!slug) {
        result.history.push(
          "deploy-portfolio: ERROR: Could not generate a name from .env file."
        );
        break;
      }

      result.history.push("Connecting to data-warehouse");
      result.history.push("Saving configuration...");

      const payload = {
        slug: slug,
        envContent: envNode,
        username: userData.username || "user",
      };

      fetch(APPS_SCRIPT_URL, {
        method: "POST",
        mode: "no-cors",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }).catch((err) => {
        console.error("Error sending to Apps Script:", err);
      });

      const nginxConfig = `
server {
    listen 80;
    server_name domain.com;

    root /var/www/html;
    index index.html;

    location /result/${slug} {
        try_files /index.html =404;
    }
}
    `;

      let newFs = setFsNode(
        fileSystem,
        "/etc/nginx/sites-available/portfolio",
        nginxConfig
      );
      result.fileSystem = newFs;

      result.history.push("Saving... OK.");
      result.history.push(" ");
      result.history.push("Deployment successful!");
      result.history.push({
        text: `View at: /result/${slug}`,
        type: "link",
        url: `/result/${slug}`,
      });
      break;
    }

    case "chall":
      result.startChallenge = true;
      result.history.push("Challenge Mode Activated!");
      result.history.push("Your tasks are now visible on-screen.");
      break;

    case "help":
      result.history.push("Debian Web Sandbox Commands:");
      result.history.push("  Navigasi:  ls, cd, pwd");
      result.history.push(
        "  File:      cat, less, mkdir, touch, cp, mv, rm, rmdir"
      );
      result.history.push("  Editor:    nano, vi");
      result.history.push("  Akses:     chmod, chown");
      result.history.push("  Paket:     apt (update, install)");
      result.history.push("  Sesi:      help, clear, exit");
      break;

    case "clear":
      result.clear = true;
      break;

    case "exit":
      result.exit = true;
      result.history.push("logout");
      break;

    case "reboot":
      result.reboot = true;
      result.history.push("reboot: System is rebooting...");
      break;

    case "":
      break;

    default:
      result.history.push(`bash: command not found: ${command}`);
  }

  return result;
};
