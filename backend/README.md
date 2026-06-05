# Notes Management System - Backend API Server

This is the Express.js and PostgreSQL backend server for the **Notes Management System** application. It supports full CRUD operations, note pinning, tagging, bulk notes insertion, robust request validations, and automatic database initialization.

---

## 🛠 Tech Stack

* **Runtime**: Node.js
* **Framework**: Express.js (v5)
* **Database**: PostgreSQL (v13+)
* **Database Client**: node-postgres (`pg`)
* **Environment Configuration**: `dotenv`
* **CORS Middleware**: `cors`
* **Development Server**: `nodemon`

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js** (v18+ recommended)
- **PostgreSQL** instance running locally or hosted

### 2. Installation
Navigate to the backend directory and install the dependencies:
```bash
npm install
```

### 3. Environment Setup
Create a `.env` file in the root of the `backend` directory (if not already present) and define your port and PostgreSQL connection string:
```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/notes-db?schema=public"
PORT=5000
```

### 4. Running the Server

#### Development Mode (with hot-reloading)
```bash
npm run dev
```
*Note: On startup, the server automatically reads `schema.sql` and runs migrations to initialize the tables (`users` and `notes`) and populate seed data if they do not exist.*

#### Production Mode
```bash
npm start
```

---

## 🗄 Database Design

The database schema is defined in `schema.sql` and contains the following tables:

### 1. `users` Table
Stores registered workspace profiles.
- `id` (SERIAL, Primary Key): Unique numeric identifier
- `name` (VARCHAR): Profile workspace display name
- `email` (VARCHAR, Unique): Profile login email
- `password` (VARCHAR): Hashed or plain login password (defaults to `'123456'`)

### 2. `notes` Table
Stores workspace note entities.
- `id` (UUID, Primary Key): Unique string UUID (automatically generated via `uuid_generate_v4()`)
- `title` (VARCHAR): Title of the note (non-empty validation enforced)
- `content` (TEXT): Core content body of the note
- `is_pinned` (BOOLEAN): Floating status to pin notes to the top (defaults to `FALSE`)
- `tags` (TEXT[]): Native PostgreSQL string array of tags (defaults to `{}`)
- `user_id` (INTEGER, Foreign Key): References `users(id)` with `ON DELETE CASCADE`
- `created_at` (TIMESTAMP WITH TIME ZONE): Auto-creation timestamp
- `updated_at` (TIMESTAMP WITH TIME ZONE): Auto-updated timestamp

---

## 🔌 API Documentation

### Note Endpoints

#### 1. List Notes
- **Route**: `GET /notes`
- **Query Parameters**:
  - `q` or `search` (Optional): Searches for matches inside `title` and `content` (case-insensitive)
- **Description**: Returns all notes, sorted by `isPinned DESC` first, then `updatedAt DESC`.
- **Response Payloads**: Includes a generated `preview` field (first 100 characters of the body + `...` if trimmed).

#### 2. Get Single Note
- **Route**: `GET /notes/:id`
- **Description**: Retrieves full details of a specific note by its UUID.

#### 3. Create Note(s)
- **Route**: `POST /notes`
- **Request Body (Single Note)**:
  ```json
  {
    "title": "Grocery List",
    "content": "Buy apples, milk, and eggs.",
    "userId": 1,
    "isPinned": false,
    "tags": ["personal", "shopping"]
  }
  ```
- **Request Body (Bulk Notes Array)**:
  ```json
  [
    { "title": "Work Tasks", "content": "Complete documentation." },
    { "title": "Ideas", "content": "Build an offline notes app." }
  ]
  ```
- **Validation**: Enforces that `title` is present, is a string, and is not empty. Returns `400 Bad Request` on failure.

#### 4. Update Note
- **Route**: `PUT /notes/:id`
- **Request Body**: Accepts any combination of `title`, `content`, `isPinned`, and `tags`.
- **Description**: Updates fields, resets `updated_at` to the current timestamp, and returns the modified object.

#### 5. Delete Note
- **Route**: `DELETE /notes/:id`
- **Description**: Removes note from the database by its UUID.

#### 6. Note Count
- **Route**: `GET /notes/count`
- **Description**: Returns total count of all notes.

---

### User & Authentication Endpoints

- `GET /users`: Lists all users.
- `GET /users/:id`: Retrieves user profile by numeric ID.
- `PUT /users/:id`: Edits user display name.
- `GET /profile/:id`: Gets display name string for user.
- `GET /user-notes/:userId`: Retrieves all notes belonging to a specific user.
- `POST /login`: Validates user email and password credentials.

---

## 🛡 Validations & Safety Guardrails
- **Title Validation**: Employs backend checks to return a JSON error response before inserting or updating data (`Title must not be empty` / `400`).
- **Null Safety**: Auto-maps missing parameters safely (e.g. content defaults to empty strings, tags default to empty arrays).
- **ID Matching**: Validates path parameters to throw appropriate `404 Not Found` messages instead of SQL syntax execution failures.
