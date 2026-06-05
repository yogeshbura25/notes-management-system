# Notes Management System

Welcome to the **Notes Management System**, a high-performance, premium notes workspace application. This is a complete notes management solution featuring full CRUD operations, note pinning, tag filtering, owner assignment, debounced search, real-time auto-saving, responsive mobile drawer views, and schema initialization.

The system is split into two components:
1. **Frontend**: Built using **React** styled with **Tailwind CSS v4**.
2. **Backend**: Built using **Express.js (v5)** and **PostgreSQL** database.

---

## 🚀 Core Features

### 1. Notes List & Workspace Sidebar
* **Pinned vs. Recent Grouping**: Notes are visually split into a "Pinned Notes" section and a "Recent Notes" list. Pinned notes float to the top automatically.
* **Content Previews**: Each card in the list renders a formatted date, a clean snippet of the note body, and all assigned tags.
* **Workspace Profile Switcher**: A workspace dropdown in the sidebar lets you switch between seeded users (**Amit** or **Riya**), or display notes from **All Users** simultaneously.

### 2. Search & Tag Filtering
* **Debounced API Search**: Typing in the search bar automatically filters notes by title or content. The search is debounced by 300ms to reduce database query overhead.
* **Interactive Tag Cloud**: The sidebar displays a tag cloud constructed dynamically from all tags in the active notes list. Clicking any tag badge filters the notes instantly.

### 3. Editor Form & Assignment
* **Dynamic Markdown-Ready Workspace**: Large text area for content with real-time word and character counts.
* **Owner Assignment**: Notes can be dynamically assigned or re-assigned to any user profile in the database via the header dropdown.
* **Inline Tag Manager**: Easily add new tags by typing them and hitting `Enter`, or delete existing tags by clicking the `x` next to them.

### 4. Interactive Auto-Save Engine
* **Debounced Save Status**: Auto-save is triggered automatically 1.5 seconds after typing activity stops.
* **Status Flags**: The editor displays real-time sync states:
  * `Saving...`: Sending updates to the PostgreSQL server.
  * `Saved`: Confirmation that changes are safe in the database.
  * `Synced`: The document is fully up to date.
  * `Save Failed`: Alerting the user if there's a connection issue.
* **Note Switch Edge-Case Safety**: If a user switches to another note or clicks "Delete" while changes are pending, the save queue is flushed immediately, preventing data loss.

### 5. Responsive Design & Mobile Drawer
* **Adaptive Viewports**:
  * **Desktop**: Double-panel grid (sidebar + note editor).
  * **Mobile / Tablet**: Dynamic sliding drawer layout. The list is shown first; clicking a note smoothly slides in the full-screen editor with a "Back to list" button.
* **Glassmorphism Theme**: Features HSL tailored color variables, sleek dark mode adaptation, custom thin scrollbars, and fluid keyframe micro-animations.

### 6. Error Handling & Loading States
* **Skeleton Pulser**: Pulsing card shapes match the exact grid of the sidebar and editor during the initial data load, preventing cumulative layout shifts (CLS).
* **Toast Notification Banners**: Slide-up alerts show successful creations, pins, deletions, or server failures.
* **Graceful Database Fallbacks**: If the Postgres database or Express server becomes unreachable, the app alerts the user and displays a friendly offline recovery state.

---

## 🛠 Technical Setup & Execution

### 1. Prerequisites
- **Node.js** (v18+ recommended)
- **PostgreSQL** instance running locally or hosted

### 2. Running Locally

#### Start the Backend Server
1. Navigate to the `backend` folder:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure your connection by creating a `.env` file:
   ```env
   DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/notes-db?schema=public"
   PORT=5000
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```
   *The server will automatically initialize tables (`users` and `notes`) and seed initial data if they do not exist.*

#### Start the Frontend Server
1. Navigate to the `frontend` folder:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
   *Vite compiles resources and makes the application available in your browser.*