import { getDirNode } from "../utils/commandLogic.js";

export const getInitialChallengeTasks = (homeDir) => [
  {
    id: 1,
    text: "Create a directory 'projects' in your home.",
    completed: false,
    check: (fs) => {
      const node = getDirNode(`${homeDir}/projects`, fs);
      return node && typeof node === "object";
    },
  },
  {
    id: 2,
    text: "Navigate into the 'projects' directory.",
    completed: false,
    check: (fs, cd) => cd === `${homeDir}/projects`,
  },
  {
    id: 3,
    text: "Create a file 'mission.txt'.",
    completed: false,
    check: (fs) => getDirNode(`${homeDir}/projects/mission.txt`, fs) !== null,
  },
  {
    id: 4,
    text: "Write 'I did it!' into 'mission.txt'.",
    completed: false,
    check: (fs) =>
      getDirNode(`${homeDir}/projects/mission.txt`, fs) === "I did it!",
  },
  {
    id: 5,
    text: "Move 'mission.txt' to your 'Documents' folder.",
    completed: false,
    check: (fs) =>
      getDirNode(`${homeDir}/projects/mission.txt`, fs) === null &&
      getDirNode(`${homeDir}/Documents/mission.txt`, fs) === "I did it!",
  },
];

export const checkChallengeProgress = (
  currentTasks,
  currentFs,
  currentDir,
  homeDir
) => {
  const wasIncomplete = currentTasks.some((task) => !task.completed);
  let allDone = true;

  const newTasks = currentTasks.map((task) => {
    if (task.completed) return task;
    const isCompleted = task.check(currentFs, currentDir, homeDir);
    if (!isCompleted) allDone = false;
    return { ...task, completed: isCompleted };
  });

  return {
    newTasks,
    allDone,
    justCompleted: wasIncomplete && allDone,
  };
};
