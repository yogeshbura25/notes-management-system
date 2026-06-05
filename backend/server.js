require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
const fs = require("fs");
const path = require("path");

const app = express();

app.use(cors());
app.use(express.json());

// Initialize PG Pool
const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

// Run Schema migrations on startup
async function initDb() {
    try {
        const schemaPath = path.join(__dirname, "schema.sql");
        const schema = fs.readFileSync(schemaPath, "utf8");
        await pool.query(schema);
        console.log("Database tables initialized successfully. ✅");
    } catch (err) {
        console.error("Failed to initialize database tables:", err);
    }
}

function fetchExternalData() {
    return { status: "success", data: "External system online" };
}

// User routes
app.get("/users", async (req, res) => {
    try {
        const { rows } = await pool.query("SELECT * FROM users ORDER BY id ASC");
        res.send(rows);
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
});

app.get("/users/:id", async (req, res) => {
    try {
        const id = req.params.id;
        if (isNaN(id)) {
            return res.status(404).send({ error: "User not found" });
        }
        const { rows } = await pool.query("SELECT * FROM users WHERE id = $1", [id]);
        if (rows.length === 0) {
            return res.status(404).send({ error: "User not found" });
        }
        res.send(rows[0]);
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
});

app.put("/users/:id", async (req, res) => {
    try {
        const id = req.params.id;
        if (isNaN(id)) {
            return res.status(404).send({ error: "User not found" });
        }
        const { name } = req.body;
        if (!name || typeof name !== "string" || name.trim() === "") {
            return res.status(400).send({ error: "Name must not be empty" });
        }
        const { rows } = await pool.query(
            "UPDATE users SET name = $1 WHERE id = $2 RETURNING *",
            [name.trim(), id]
        );
        if (rows.length === 0) {
            return res.status(404).send({ error: "User not found" });
        }
        res.send(rows[0]);
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
});

app.get("/profile/:id", async (req, res) => {
    try {
        const id = req.params.id;
        if (isNaN(id)) {
            return res.status(404).send({ error: "User not found" });
        }
        const { rows } = await pool.query("SELECT name FROM users WHERE id = $1", [id]);
        if (rows.length === 0) {
            return res.status(404).send({ error: "User not found" });
        }
        res.send(rows[0].name);
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
});

app.get("/user-notes/:userId", async (req, res) => {
    try {
        const userId = req.params.userId;
        if (isNaN(userId)) {
            return res.send([]);
        }
        const { rows } = await pool.query(
            `SELECT id, title, content, user_id AS "userId", 
                    is_pinned AS "isPinned", tags,
                    created_at AS "createdAt", updated_at AS "updatedAt" 
             FROM notes WHERE user_id = $1
             ORDER BY is_pinned DESC, "updatedAt" DESC`,
            [userId]
        );
        res.send(rows);
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
});

app.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).send({ message: "Email and password are required" });
        }
        const { rows } = await pool.query(
            "SELECT * FROM users WHERE email = $1 AND password = $2",
            [email, password]
        );
        if (rows.length > 0) {
            res.send({ message: "Login successful" });
        } else {
            res.status(401).send({ message: "Invalid credentials" });
        }
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
});

// Note routes
app.get("/notes/count", async (req, res) => {
    try {
        const { rows } = await pool.query("SELECT COUNT(*) AS total FROM notes");
        res.send({ total: parseInt(rows[0].total, 10) });
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
});

app.get("/external-data", async (req, res) => {
    try {
        const data = fetchExternalData();
        res.send(data);
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
});

app.get("/notes", async (req, res) => {
    try {
        const { search, q } = req.query;
        const query = (search || q || "").trim();

        let sql = `SELECT id, title, content, user_id AS "userId", 
                          is_pinned AS "isPinned", tags,
                          created_at AS "createdAt", updated_at AS "updatedAt" 
                   FROM notes`;
        const params = [];

        if (query) {
            sql += " WHERE title ILIKE $1 OR content ILIKE $1";
            params.push(`%${query}%`);
        }

        sql += ' ORDER BY is_pinned DESC, "updatedAt" DESC';

        const { rows } = await pool.query(sql, params);

        const notesWithPreview = rows.map(note => {
            const contentStr = note.content || "";
            const preview = contentStr.length > 100 
                ? contentStr.substring(0, 100) + "..." 
                : contentStr;
            return {
                ...note,
                preview
            };
        });

        res.send(notesWithPreview);
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
});

app.get("/notes/:id", async (req, res) => {
    try {
        const noteId = req.params.id;
        const { rows } = await pool.query(
            `SELECT id, title, content, user_id AS "userId", 
                    is_pinned AS "isPinned", tags,
                    created_at AS "createdAt", updated_at AS "updatedAt" 
             FROM notes WHERE id::text = $1`,
            [noteId]
        );
        if (rows.length === 0) {
            return res.status(404).send({ error: "Note not found" });
        }
        const note = rows[0];
        const contentStr = note.content || "";
        const preview = contentStr.length > 100 
            ? contentStr.substring(0, 100) + "..." 
            : contentStr;
        res.send({ ...note, preview });
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
});

app.post("/notes", async (req, res) => {
    const body = req.body;

    const validateNote = (noteData) => {
        const { title, content, userId, isPinned, tags } = noteData;
        if (!title || typeof title !== "string" || title.trim() === "") {
            throw new Error("Title must not be empty");
        }
        return {
            title: title.trim(),
            content: (content || "").trim(),
            userId: userId ? parseInt(userId, 10) : null,
            isPinned: !!isPinned,
            tags: Array.isArray(tags) ? tags : []
        };
    };

    try {
        if (Array.isArray(body)) {
            if (body.length === 0) {
                return res.status(400).send({ error: "Array of notes cannot be empty" });
            }

            const validatedList = body.map(noteItem => validateNote(noteItem));
            const insertedNotes = [];

            for (const note of validatedList) {
                const { rows } = await pool.query(
                    `INSERT INTO notes (title, content, user_id, is_pinned, tags) 
                     VALUES ($1, $2, $3, $4, $5) 
                     RETURNING id, title, content, user_id AS "userId", is_pinned AS "isPinned", tags,
                               created_at AS "createdAt", updated_at AS "updatedAt"`,
                    [note.title, note.content, note.userId, note.isPinned, note.tags]
                );
                insertedNotes.push(rows[0]);
            }
            return res.status(201).send(insertedNotes);
        } else {
            const note = validateNote(body);
            const { rows } = await pool.query(
                `INSERT INTO notes (title, content, user_id, is_pinned, tags) 
                 VALUES ($1, $2, $3, $4, $5) 
                 RETURNING id, title, content, user_id AS "userId", is_pinned AS "isPinned", tags,
                           created_at AS "createdAt", updated_at AS "updatedAt"`,
                [note.title, note.content, note.userId, note.isPinned, note.tags]
            );
            return res.status(201).send(rows[0]);
        }
    } catch (error) {
        return res.status(400).send({ error: error.message });
    }
});

app.put("/notes/:id", async (req, res) => {
    try {
        const noteId = req.params.id;
        const { title, content, isPinned, tags } = req.body;

        // Check if note exists
        const checkRes = await pool.query("SELECT * FROM notes WHERE id::text = $1", [noteId]);
        if (checkRes.rows.length === 0) {
            return res.status(404).send({ error: "Note not found" });
        }

        const currentNote = checkRes.rows[0];
        let newTitle = currentNote.title;
        let newContent = currentNote.content;
        let newIsPinned = currentNote.is_pinned;
        let newTags = currentNote.tags;

        if (title !== undefined) {
            if (typeof title !== "string" || title.trim() === "") {
                return res.status(400).send({ error: "Title must not be empty" });
            }
            newTitle = title.trim();
        }

        if (content !== undefined) {
            newContent = (content || "").trim();
        }

        if (isPinned !== undefined) {
            newIsPinned = !!isPinned;
        }

        if (tags !== undefined) {
            newTags = Array.isArray(tags) ? tags : [];
        }

        const { rows } = await pool.query(
            `UPDATE notes 
             SET title = $1, content = $2, is_pinned = $3, tags = $4, updated_at = CURRENT_TIMESTAMP 
             WHERE id::text = $5 
             RETURNING id, title, content, user_id AS "userId", is_pinned AS "isPinned", tags,
                       created_at AS "createdAt", updated_at AS "updatedAt"`,
            [newTitle, newContent, newIsPinned, newTags, noteId]
        );

        res.send(rows[0]);
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
});

app.delete("/notes/:id", async (req, res) => {
    try {
        const noteId = req.params.id;
        const { rowCount } = await pool.query("DELETE FROM notes WHERE id::text = $1", [noteId]);
        if (rowCount === 0) {
            return res.status(404).send({ error: "Note not found" });
        }
        res.send({ message: "Note deleted successfully" });
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
});

// Sum endpoint
app.post("/sum", (req, res) => {
    const { a, b } = req.body;
    if (typeof a !== "number" || typeof b !== "number") {
        return res.status(400).send({ error: "a and b must be numbers" });
    }
    const total = a + b;
    res.send({ total });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send({ error: "Something went wrong!" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
    await initDb();
    console.log(`Server running on port ${PORT}`);
});
