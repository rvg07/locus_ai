const Groq = require('groq-sdk');
const db = require('../config/db');
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const calendarService = require('../services/calendarService');


exports.getMorningBriefing = async (req, res) => {
    const userId = req.session.userId;
    try {
        const [prefsRows] = await db.query("SELECT * FROM user_preferences WHERE user_id = ?", [userId]);
        if (prefsRows.length === 0) {
            return res.status(404).json({ message: "User preferences not found." });
        }
        const preferences = prefsRows[0];
        const [tasks] = await db.query(
            "SELECT title, priority FROM tasks WHERE user_id = ? AND status IN ('to_do', 'in_progress')",
            [userId]
        );

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const [events] = await db.query(
            "SELECT title, start_time, description, cognitive_load, category FROM events WHERE user_id = ? AND start_time >= ? AND start_time < ? ORDER BY start_time ASC",
            [userId, today, tomorrow]
        );

        const highPriorityTasks = tasks.filter(t => t.priority === 'high');
        const formattedTasks = highPriorityTasks.length > 0
            ? highPriorityTasks.map(t => `- ${t.title}`).join('\n')
            : 'No high-priority tasks for today.';

        const formattedEvents = events.length > 0
            ? events.map(e => {
                const eventTime = new Date(e.start_time).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
                return `- ${eventTime}: ${e.title} (Carico: ${e.cognitive_load}, Categoria: ${e.category})`;
            }).join('\n')
            : 'No meetings or events scheduled for today.';
            
        const userPreferences = `L'utente è più produttivo dalle ${preferences.productive_hours_start.substring(0, 5)} alle ${preferences.productive_hours_end.substring(0, 5)} e preferisce una pausa dopo incontri lunghi.`;

        const prompt = `
            Sei un assistente AI empatico e di supporto per un professionista, specializzato nel ridurre il carico cognitivo.
            Il tuo tono è calmo, positivo e strategico.
            Analizza i seguenti dati per la giornata di oggi e genera un piano d'azione chiaro e rassicurante (massimo 500 parole).

            Il tuo obiettivo è aiutare l'utente a navigare la giornata con meno stress. Per farlo:
            1.  Identifica gli eventi a carico cognitivo 'alto' e considerali i momenti più impegnativi.
            2.  Suggerisci di affrontare i task ad alta priorità durante le ore più produttive dell'utente.
            3.  Consiglia di inserire attività più leggere o pause attorno agli eventi a carico 'high'.
            4.  Se ci sono eventi a carico 'high' consecutivi, suggerisci esplicitamente una breve pausa tra di essi.
            5.  Concludi con un incoraggiamento personalizzato.
            6.  Non menzionare mai le parole "Briefing mattutino".

            **Eventi in Calendario Oggi:**
            ${formattedEvents}

            **Task Importanti da Svolgere:**
            ${formattedTasks}

            **Preferenze e Abitudini dell'Utente:**
            ${userPreferences}
        `;

        const response = await groq.chat.completions.create({
            model: "qwen/qwen3-32b",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.7,
        });

        const rawBriefingText = response.choices[0].message.content;
        const cleanedBriefingText = rawBriefingText.replace(/<think>[\s\S]*?<\/think>\s*/, '');
        res.json({ briefingText: cleanedBriefingText });

    } catch (error) {
        console.error("Error during briefing creation: ", error);
        res.status(500).json({ message: "Error during briefing creation." });
    }
};

exports.getUpcomingMeetingBrief = async (req, res) => {
    const userId = req.session.userId;
    try {
        const now = new Date();
        const lookaheadTime = new Date(now.getTime() + 15 * 60 * 1000);
        const [eventRows] = await db.query(
            `SELECT title, 
    start_time,
    NOW() AS ora_attuale_del_database 
    FROM events 
    WHERE user_id = 1`,
            [userId, now, lookaheadTime]
        );

        if (eventRows.length === 0) {
            return res.json({ upcomingMeeting: null });
        }

        let eventToBrief;
        let prompt;
        if (eventRows.length === 1) {
            eventToBrief = eventRows[0];
            const [relatedTasks] = await db.query(
                `SELECT title FROM tasks WHERE user_id = ? AND status IN ('to_do', 'in_progress') AND title LIKE ?`,
                [userId, `%${eventToBrief.title}%`]
            );
            const formattedTasks = relatedTasks.length > 0
                ? relatedTasks.map(t => `- ${t.title}`).join('\n')
                : 'Nessun task direttamente collegato.';

            prompt = `
                Sei un assistente esecutivo. Prepara un briefing conciso e orientato all'azione per la seguente riunione imminente.
                Obiettivi: Riassumi l'obiettivo, elenca 2-3 punti chiave, menziona i task preparatori e dai un consiglio basato sul carico cognitivo. Concludi con una frase che infonda sicurezza.

                **Dettagli Riunione:**
                - Titolo: ${eventToBrief.title}
                - Descrizione: ${eventToBrief.description || 'Nessuna.'}
                - Carico Cognitivo: ${eventToBrief.cognitive_load}
                **Task Correlati:**
                ${formattedTasks}
            `;
        } else {
            // here case of simultaneous meetings
            eventToBrief = eventRows[0];
            const formattedConflicts = eventRows.map(e => 
                `- "${e.title}" (Carico Cognitivo: ${e.cognitive_load})`
            ).join('\n');

            prompt = `
                **ATTENZIONE: Conflitto di Pianificazione!**
                Ci sono più riunioni che iniziano nello stesso momento. Il tuo compito è analizzarle, consigliare a quale partecipare e fornire un breve briefing SOLO per quella scelta.

                **Criterio di decisione:** La priorità assoluta va alla riunione con il carico cognitivo più alto ('high' > 'medium' > 'low'). 
                Se il carico è uguale, scegli la prima della lista.

                **Riunioni in conflitto:**
                ${formattedConflicts}

                **Istruzioni:**
                1. Inizia con una frase chiara che consiglia a quale riunione partecipare. Esempio: "C'è un conflitto. Ti consiglio di partecipare a [Titolo Riunione] perché è strategicamente più importante."
                2. A seguire, fornisci un briefing conciso (obiettivo, 2-3 punti chiave) solo per la riunione che hai consigliato.
            `;
        }

        const response = await groq.chat.completions.create({
            model: "qwen/qwen3-32b",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.5,
        });

        const rawBriefingText = response.choices[0].message.content;
        const cleanedBriefingText = rawBriefingText.replace(/<think>[\s\S]*?<\/think>\s*/, '');
        res.json({
            upcomingMeeting: {
                title: eventToBrief.title,
                startTime: eventToBrief.start_time,
                brief: cleanedBriefingText,
                conflict: eventRows.length > 1
            }
        });

    } catch (error) {
        console.error("Error on creating pre-meeting brief:", error);
        res.status(500).json({ message: "Error on creating pre-meeting brief." });
    }
};

exports.executeAction = async (req, res) => {
    const userId = req.session.userId;
    const { prompt: userPrompt } = req.body;

    if (!userPrompt) {
        return res.status(400).json({ message: "The prompt is required." });
    }

    const masterPrompt = `
        Sei un assistente AI che orchestra le azioni all'interno di un'applicazione di produttività.
        Il tuo compito è analizzare la richiesta dell'utente e tradurla in una chiamata a uno degli strumenti disponibili.
        Rispondi ESCLUSIVAMENTE con un oggetto JSON che abbia la seguente struttura: { "action": "nome_azione", "parameters": { ... } }

        **Strumenti Disponibili:**

        1.  **action_name**: "create_event"
            **description**: "Crea un nuovo evento nel calendario con un link di Google Meet."
            **parameters**: {
                "title": "string (obbligatorio)",
                "description": "string (opzionale)",
                "startTime": "string in formato ISO 8601 (obbligatorio)",
                "endTime": "string in formato ISO 8601 (obbligatorio)"
            }

        2.  **action_name**: "create_task"
            **description**: "Aggiunge un nuovo compito (task) o promemoria alla to-do list dell'utente."
            **parameters**: {
                "title": "string (obbligatorio)",
                "priority": "string (opzionale, valori: 'low', 'medium', 'high'. Se l'utente dice 'urgente' o 'importante' o sinonimi, usa 'high')",
                "dueDateTime": "string in formato ISO 8601 (YYYY-MM-DDTHH:mm:ss.sssZ) (opzionale, da usare se l'utente specifica un orario)"
            }

        3.  **action_name**: "reschedule_event"
            **description**: "Ripianifica un evento esistente a un nuovo orario."
            **parameters**: {
                "eventId": "number (obbligatorio, l'ID dell'evento da spostare)",
                "newStartTime": "string in formato ISO 8601 (obbligatorio)"
            }

        4.  **action_name**: "sync_calendar"
            **description**: "Sincronizza il calendario dell'utente con Google Calendar."
            **parameters**: {}

        **Istruzioni:**
        - Analizza la richiesta dell'utente qui sotto.
        - Se la richiesta corrisponde a uno strumento, estrai i parametri e formatta la risposta JSON.
        - Se non capisci la richiesta o non corrisponde a nessuno strumento, rispondi con: { "action": "unknown", "parameters": {} }
        - Interpreta le date relative (es. "domani alle 10", "tra 2 ore") basandoti sulla data attuale: ${new Date().toISOString()}

        **Richiesta Utente:** "${userPrompt}"
    `;

    try {
        const response = await groq.chat.completions.create({
            model: "qwen/qwen3-32b",
            messages: [{ role: "user", content: masterPrompt }],
            temperature: 0.1,
            response_format: { type: "json_object" },
        });

        const actionData = JSON.parse(response.choices[0].message.content);
        switch (actionData.action) {

            case 'create_event':
                const result = await calendarService.createEventWithMeet(userId, actionData.parameters);
                return res.json({ 
                    ai_response: "Ok, ho creato l'evento nel tuo calendario.",
                    details: result 
                });

            case 'create_task':
                return res.json({ 
                    message: "Action 'create_task' is recognized..",
                    details: actionData.parameters  
                });

            case 'reschedule_event':
                return res.json({ 
                    message: "Action 'reschedule_event' is recognized.",
                    data: actionData.parameters 
                });

            case 'sync_calendar':
                return res.json({ 
                    message: "Action 'sync_calendar' is recognized.",
                    data: actionData.parameters 
                });

            case 'unknown':
            default:
                return res.status(400).json({ message: "I didn't understand the request or can't perform this action." });
        }

    } catch (error) {
        console.error("Error executing AI action:", error);
        res.status(500).json({ message: "Error parsing command." });
    }
};