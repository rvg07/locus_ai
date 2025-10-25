const app = require ('./backend/src/app');
require('dotenv').config();

const APP_PORT = process.env.APP_PORT || 3000;

app.listen(APP_PORT, () => {
    console.log(`[PROXY] Running on port ${APP_PORT}`);
})