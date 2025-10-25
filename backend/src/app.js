require('dotenv').config();
const express = require('express');
const app = express();
const session = require('express-session');

app.use(express.json());

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } 
}));

const authRoutes = require('./routes/auth');
const aiRoutes = require('./routes/ai');
const tasksRoutes = require('./routes/tasks');
const preferencesRoutes = require('./routes/preferences');
const calendarRoutes = require('./routes/calendar');

app.use('/api/auth', authRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/tasks', tasksRoutes);
app.use('/api/preferences', preferencesRoutes);
app.use('/api/calendar', calendarRoutes);

app.get('/', (req, res) => {
    res.send('Welcome to Locus AI!');
});

//handling api errors
app.use((err, req, res, next) => {
    let statusCode = err.status || 500;
    let errorMessage = err.message || 'Internal Server Error';
    console.error(err.stack);
    res.status(statusCode).json({
        status: "error",
        message: errorMessage
    });
});

module.exports = app;