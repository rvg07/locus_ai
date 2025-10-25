const db = require('../config/db');

exports.getPreferences = async (req, res) => {
    try {
        const [prefs] = await db.query("SELECT * FROM user_preferences WHERE user_id = ?", [req.session.userId]);
        if (prefs.length > 0) {
            res.json(prefs[0]);
        } else {
            res.status(404).json({ message: "Preferences not found." });
        }
    } catch (error) {
        res.status(500).json({ message: "Error on retrieving preferences." });
    }
};

exports.updatePreferences = async (req, res) => {
    const { productive_hours_start, productive_hours_end, focus_block_duration, wants_break_after_meeting } = req.body;
    try {
        await db.query(
            "UPDATE user_preferences SET productive_hours_start = ?, productive_hours_end = ?, focus_block_duration = ?, wants_break_after_meeting = ? WHERE user_id = ?",
            [productive_hours_start, productive_hours_end, focus_block_duration, wants_break_after_meeting, req.session.userId]
        );
        res.json({ message: "Preferences updated successfully." });
    } catch (error) {
        res.status(500).json({ message: "Error on updating the preferences." });
    }
};