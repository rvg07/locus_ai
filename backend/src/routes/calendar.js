const express = require('express');
const router = express.Router();
const calendarController = require('../controllers/calendarController');
const isAuthenticated = require('../middleware/isAuthenticated');

router.use(isAuthenticated);
router.post('/sync', calendarController.syncCalendar);
router.put('/events/:eventId', calendarController.rescheduleEvent);
router.post('/events', calendarController.createEventWithMeet);

module.exports = router;