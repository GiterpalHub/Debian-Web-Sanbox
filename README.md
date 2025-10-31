# Debian Web Sandbox

🌐 Available Languages:
- [English (Active)](./README.md)
- [Bahasa Indonesia](./docs/README.id.md)

A web-based simulation of the Debian TUI (Text User Interface) installer and a basic terminal environment, built with React.

## Purpose

This project is an educational tool designed to help new users get familiar with the Debian installation process and a basic Linux command-line interface in a safe, risk-free web browser environment. It aims to simulate the "feel" of a real installation to build a better understanding for those learning about Linux.

## Current Features

### 1. Installer Simulation

A multi-step, TUI-style installer that walks through the following (simulated) steps:

* Language, location, and keyboard selection.
* Hostname and user account setup.
* A menu-driven partitioner (simulating "Guided partitioning" based on user input).
* A series of realistic, scrolling installation logs (Base System, GRUB, Final Configuration).

### 2. Terminal Simulation

After installation, the system "reboots" into a simulated TTY login prompt. After logging in with the user created during installation, you are dropped into a basic terminal environment.

**Supported Commands:**

* **Navigation:** `cd`, `ls`, `dir`
* **File/Directory:** `cat`, `mkdir`, `touch`, `rm`, `rmdir`
* **Editors:** `nano`, `vi` (both open a simple text editor with `Ctrl+X` to save/exit)
* **Session:** `clear`, `exit` (logs you out)

## How to Run

This project was built with [Vite](https://vitejs.dev/).

1.  **Install dependencies:**
    ```sh
    npm install
    ```
2.  **Run the development server:**
    ```sh
    npm run dev
    ```

## Work in Progress

This is a work-in-progress project. The file system is a simple JavaScript object, and the commands are basic simulations. More commands and deeper simulation are planned for the future.
