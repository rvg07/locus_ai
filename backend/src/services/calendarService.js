const Groq = require('groq-sdk');
const { google } = require('googleapis');
const db = require('../config/db');

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

exports.createEventWithMeet = async (userId, { title, description, startTime, endTime }) => {
    if (!title || !startTime || !endTime) {
        throw new Error("Title, start time, and end time are required.");
    }
    if (isNaN(new Date(startTime)) || isNaN(new Date(endTime))) {
        throw new Error("Invalid date format.");
    }

    const [userRows] = await db.query('SELECT auth_token FROM users WHERE user_id = ?', [userId]);
    if (userRows.length === 0 || !userRows[0].auth_token) {
        throw new Error("Authentication token not found.");
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

    let start = new Date(newEvent.start.dateTime);
    start.setHours(start.getHours() - 2);

    let end = new Date(newEvent.end.dateTime);
    end.setHours(end.getHours() - 2);

    await db.query(
        `INSERT INTO events (user_id, external_calendar_id, title, description, start_time, end_time, cognitive_load, category)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            userId, newEvent.id, newEvent.summary, newEvent.description,
            start, end,
            cognitiveLoad, 'meeting'
        ]
    );

    return {
        message: "Event successfully created on Google Calendar and in the database.",
        event: {
            title: newEvent.summary,
            startTime: newEvent.start.dateTime,
            endTime: newEvent.end.dateTime,
            meetLink: newEvent.hangoutLink
        }
    };
}