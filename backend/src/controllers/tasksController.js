const db = require('../config/db');

exports.getAllTasks = async (req, res) => {
    try {
        const [tasks] = await db.query("SELECT * FROM tasks WHERE user_id = ? ORDER BY created_at DESC", [req.session.userId]);
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ message: "Error on retrieving tasks" });
    }
};

exports.createTask = async (req, res) => {
    const { title, description, priority, dueDate } = req.body;
    if (!title) {
        return res.status(400).json({ message: "Title is required" });
    }
    try {
        const [result] = await db.query(
            "INSERT INTO tasks (user_id, title, description, priority, due_date) VALUES (?, ?, ?, ?, ?)",
            [req.session.userId, title, description, priority, dueDate || null]
        );
        res.status(201).json({ id: result.insertId, title, priority });
    } catch (error) {
        res.status(500).json({ message: "Error on creating task" });
    }
};

exports.updateTask = async (req, res) => {
    const { id } = req.params;
    const { title, description, priority, status, dueDate } = req.body;
    try {
        await db.query(
            "UPDATE tasks SET title = ?, description = ?, priority = ?, status = ?, due_date = ? WHERE task_id = ? AND user_id = ?",
            [title, description, priority, status, dueDate, id, req.session.userId]
        );
        res.json({ message: "Task updated successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error on updating task" });
    }
};

exports.deleteTask = async (req, res) => {
    const { id } = req.params;
    try {
        await db.query("DELETE FROM tasks WHERE task_id = ? AND user_id = ?", [id, req.session.userId]);
        res.json({ message: "Task successfully deleted" });
    } catch (error) {
        res.status(500).json({ message: "Error on deleting task" });
    }
};