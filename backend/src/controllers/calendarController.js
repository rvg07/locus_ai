const Groq = require('groq-sdk');
const { google } = require('googleapis');
const db = require('../config/db');
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const getGoogleAuthClient = (tokens) => {
    const oAuth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        process.env.GOOGLE_REDIRECT_URI
    );
    oAuth2Client.setCredentials(tokens);
    return oAuth2Client;
};

async function getCognitiveLoadForEvent(event) {
    const title = event.summary || 'Nessun Titolo';
    const description = event.description || 'Nessuna descrizione.';
    const attendeesCount = event.attendees ? event.attendees.length : 1;
    const startTime = new Date(event.start.dateTime || event.start.date);
    const endTime = new Date(event.end.dateTime || event.end.date);
    const durationMinutes = (endTime - startTime) / (1000 * 60);

    const prompt = `
        Analizza il seguente evento del calendario e classifica il suo carico cognitivo.
        Rispondi ESCLUSIVAMENTE con una delle seguenti parole: 'low', 'medium', o 'high'.
        
        Dettagli evento:
        - Titolo: "${title}"
        - Descrizione: "${description}"
        - Durata: ${durationMinutes} minuti
        - Partecipanti: ${attendeesCount}

        Considera che riunioni con parole come "review", "planning", "decisione", "urgente" o con molti partecipanti e lunga durata hanno un carico più alto e quindi devi assegnerare cognitive_load "high". 
        **Criterio di decisione:** La priorità assoluta va alla riunione con il carico cognitivo più alto ('high' > 'medium' > 'low'). 
        Se il carico è uguale, scegli la prima della lista.
        Riunioni brevi come "check-in" o "stand-up" hanno un carico più basso.
    `;

    try {
        const response = await groq.chat.completions.create({
            model: "qwen/qwen3-32b",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.1,
        });

        const classification = response.choices[0].message.content.toLowerCase().trim();
        if (['low', 'medium', 'high'].includes(classification)) {
            return classification;
        }
        return 'medium'; //medium here as defaultt

    } catch (error) {
        console.error("AI classification failed for event:", title, error);
        return 'medium';
    }
}

exports.syncCalendar = async (req, res) => {
    const userId = req.session.userId;
    try {
        const [userRows] = await db.query('SELECT auth_token FROM users WHERE user_id = ?', [userId]);
        if (userRows.length === 0 || !userRows[0].auth_token) {
            return res.status(401).json({ message: "Authentication token not found." });
        }
        const tokens = JSON.parse(userRows[0].auth_token);
        const auth = getGoogleAuthClient(tokens);
        const calendar = google.calendar({ version: 'v3', auth });
        const now = new Date();
        const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        const response = await calendar.events.list({
            calendarId: 'primary',
            timeMin: now.toISOString(),
            timeMax: sevenDaysFromNow.toISOString(),
            maxResults: 50,
            singleEvents: true,
            orderBy: 'startTime',
        });
        const googleEvents = response.data.items;
        if (!googleEvents || googleEvents.length === 0) {
            return res.json({ message: "No upcoming events found in your Google Calendar." });
        }
        const eventsWithCognitiveLoad = await Promise.all(
            googleEvents.map(async (event) => {
                const cognitiveLoad = await getCognitiveLoadForEvent(event);
                return {
                    userId,
                    externalId: event.id,
                    title: event.summary || 'Nessun Titolo',
                    description: event.description || null,
                    startTime: new Date(event.start.dateTime || event.start.date),
                    endTime: new Date(event.end.dateTime || event.end.date),
                    cognitiveLoad,
                };
            })
        );
        
        const valuesToInsert = eventsWithCognitiveLoad.map(e => Object.values(e));
        const sql = `
            INSERT INTO events (user_id, external_calendar_id, title, description, start_time, end_time, cognitive_load) 
            VALUES ? 
            ON DUPLICATE KEY UPDATE 
                title = VALUES(title), 
                description = VALUES(description), 
                start_time = VALUES(start_time), 
                end_time = VALUES(end_time),
                cognitive_load = VALUES(cognitive_load)
        `;

        await db.query(sql, [valuesToInsert]);

        res.json({ message: `Sincronizzazione completata. ${googleEvents.length} eventi sono stati analizzati e salvati/aggiornati.` });

    } catch (error) {
        console.error("Error syncing calendar:", error);
        res.status(500).json({ message: "Error syncing calendar." });
    }
};

exports.rescheduleEvent = async (req, res) => {
    const userId = req.session.userId;
    const { eventId } = req.params;
    const { newStartTime } = req.body;

    if (!newStartTime || isNaN(new Date(newStartTime))) {
        return res.status(400).json({ message: "A valid start time newStartTime is required." });
    }

    try {
        const [eventRows] = await db.query(
            "SELECT external_calendar_id, start_time, end_time FROM events WHERE event_id = ? AND user_id = ?",
            [eventId, userId]
        );

        if (eventRows.length === 0) {
            return res.status(404).json({ message: "Event not found or unauthorized." });
        }
        const event = eventRows[0];
        const externalId = event.external_calendar_id;
        const [userRows] = await db.query('SELECT auth_token FROM users WHERE user_id = ?', [userId]);
        if (userRows.length === 0 || !userRows[0].auth_token) {
            return res.status(401).json({ message: "Authentication token not found." });
        }
        const tokens = JSON.parse(userRows[0].auth_token);
        let eventDurationMs = new Date(event.end_time) - new Date(event.start_time);
        const newStartDate = new Date(newStartTime);
        const newEndDate = new Date(newStartDate.getTime() + eventDurationMs);
        const auth = getGoogleAuthClient(tokens);
        const calendar = google.calendar({ version: 'v3', auth });
        await calendar.events.patch({
            calendarId: 'primary',
            eventId: externalId,
            requestBody: {
                start: {
                    dateTime: newStartDate.toISOString(),
                },
                end: {
                    dateTime: newEndDate.toISOString(),
                },
            },
        });
        await db.query(
            "UPDATE events SET start_time = ?, end_time = ? WHERE event_id = ? AND user_id = ?",
            [newStartDate, newEndDate, eventId, userId]
        );
        res.json({
            message: "Event successfully rescheduled on Google Calendar and in the database.",
            updatedEvent: {
                eventId,
                newStartTime: newStartDate.toISOString(),
                newEndTime: newEndDate.toISOString()
            }
        });

    } catch (error) {
        console.error("Error while rescheduling event:", error);
        if (error.code === 401) {
            return res.status(401).json({ message: "Google authorization expired. Please log in again." });
        }
        res.status(500).json({ message: "Internal server error while rescheduling." });
    }
};

exports.createEventWithMeet = async (req, res) => {
    const userId = req.session.userId;
    const { title, description, startTime, endTime } = req.body;
    if (!title || !startTime || !endTime) {
        return res.status(400).json({ message: "Title, start time, and end time are required." });
    }
    if (isNaN(new Date(startTime)) || isNaN(new Date(endTime))) {
        return res.status(400).json({ message: "Invalid date format." });
    }

    try {
        const [userRows] = await db.query('SELECT auth_token FROM users WHERE user_id = ?', [userId]);
        if (userRows.length === 0 || !userRows[0].auth_token) {
            return res.status(401).json({ message: "Authentication token not found." });
        }
        const tokens = JSON.parse(userRows[0].auth_token);
        const auth = getGoogleAuthClient(tokens);
        const calendar = google.calendar({ version: 'v3', auth });
        const googleResponse = await calendar.events.insert({
            calendarId: 'primary',
            conferenceDataVersion: 1,
            requestBody: {
                summary: title,
                description: description,
                start: {
                    dateTime: new Date(startTime).toISOString(),
                    timeZone: 'Europe/Rome',
                },
                end: {
                    dateTime: new Date(endTime).toISOString(),
                    timeZone: 'Europe/Rome',
                },
                conferenceData: {
                    createRequest: {
                        requestId: `locus-ai-${Date.now()}`
                    }
                }
            }
        });

        const newEvent = googleResponse.data;
        const cognitiveLoad = await getCognitiveLoadForEvent(newEvent);
        await db.query(
            `INSERT INTO events (user_id, external_calendar_id, title, description, start_time, end_time, cognitive_load, category)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                userId,
                newEvent.id,
                newEvent.summary,
                newEvent.description,
                new Date(newEvent.start.dateTime),
                new Date(newEvent.end.dateTime),
                cognitiveLoad,
                'meeting'
            ]
        );

        res.status(201).json({
            message: "Event successfully created on Google Calendar and in the database.",
            event: {
                title: newEvent.summary,
                startTime: newEvent.start.dateTime,
                endTime: newEvent.end.dateTime,
                meetLink: newEvent.hangoutLink
            }
        });

    } catch (error) {
        console.error("Error on creating event:", error);
        res.status(500).json({ message: "Internal server error on creating event." });
    }
};