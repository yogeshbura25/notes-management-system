# Notes Management System - Frontend Application

This is the interactive React frontend dashboard for the **Notes Management System**. It features a modern, premium glassmorphism interface built with **React** and styled using **Tailwind CSS v4**.

---

## ✨ Features Implemented

* **Double-Panel Dashboard**: Sidebar navigation for listing, searching, and filtering notes, alongside a rich, distraction-free markdown-ready note editor.
* **Workspace Switcher**: Easily switch between user workspaces or display notes from all users at once.
* **Pinned vs. Recent Sorting**: Keep critical notes at the top with single-click pinning.
* **Debounced Search**: Instantly query note titles and body content with built-in search debouncing to optimize performance.
* **Dynamic Tag Cloud**: Automatically aggregates all tags from your notes list to allow instant click-filtering.
* **Real-time Auto-Save**: Auto-saves your edits 1.5 seconds after typing activity stops. Includes clear status indicators (`Saving...`, `Saved`, `Synced`, `Save Failed`).
* **Responsive Mobile Views**: Responsive dual-column design that adapts into a mobile drawer overlay layout with smooth transition animations.
* **Glassmorphism Design**: High-end styling using tailormade HSL color schemes, custom thin scrollbars, and keyframe hover animations.

---

## 🛠 Tech Stack

* **Core**: React 19, JavaScript (ES6+)
* **Build Tool / Bundler**: Vite 8
* **Styling**: Tailwind CSS v4 (vanilla CSS variables configuration)
* **API Client**: Fetch API with clean asynchronous resource actions

---

## 🚀 Getting Started

### 1. Prerequisites
Ensure you have **Node.js** (v18+ recommended) installed.

### 2. Installation
Navigate into the frontend directory and install dependencies:
```bash
npm install
```

### 3. Running Development Server
Run the local Vite dev server:
```bash
npm run dev
```
The dashboard will open automatically in your browser (usually at `http://localhost:5173`). Make sure your backend API server is running on port `5000` to fetch and sync notes.

### 4. Building for Production
To build static assets for deployment:
```bash
npm run build
```
The compiled bundles will be generated under the `dist/` directory.
