const { google } = require('googleapis');
const db = require('../config/db');
const {HTTP_STATUS, STATUS_STRING, DB_ERROR_CODES}=require('../constants/index');

const oAuth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
);
// https://developers.google.com/workspace/calendar/api/auth?hl=it
// permissions grants
exports.googleLogin = (req, res) => {
    const scopes = [
        'https://www.googleapis.com/auth/userinfo.profile',
        'https://www.googleapis.com/auth/userinfo.email',
        'https://www.googleapis.com/auth/calendar.events'
    ];
    const url = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: scopes
    });
    res.redirect(url);
};

exports.googleCallback = async (req, res) => {
    const { code } = req.query;
    try {
        const { tokens } = await oAuth2Client.getToken(code);
        oAuth2Client.setCredentials(tokens);
        const oauth2 = google.oauth2({ version: 'v2', auth: oAuth2Client });
        const { data } = await oauth2.userinfo.get();
        const { id, email, name } = data;
        let [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        let userId;

        if (rows.length === 0) {
            const [result] = await db.query(
                'INSERT INTO users (email, full_name, auth_token) VALUES (?, ?, ?)',
                [email, name, JSON.stringify(tokens)]
            );
            userId = result.insertId;
            await db.query('INSERT INTO user_preferences (user_id) VALUES (?)', [userId]);
        } else {
            userId = rows[0].user_id;
            await db.query('UPDATE users SET auth_token = ? WHERE user_id = ?', [JSON.stringify(tokens), userId]);
        }
        req.session.userId = userId;
        res.redirect('http://localhost:3000/');
    } catch (error) {
        console.error("Error during Google authentication:", error);
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send("Authentication Error");
    }
};

exports.getMe = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT user_id, email, full_name FROM users WHERE user_id = ?', [req.session.userId]);
        if (rows.length > 0) {
            res.json(rows[0]);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

exports.logout = (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).json({ message: 'Logout failed' });
        }
        res.clearCookie('connect.sid');
        res.json({ message: 'Logout successful' });
    });
};