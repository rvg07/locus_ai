const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const isAuthenticated = require('../middleware/isAuthenticated');

router.use(isAuthenticated);
router.get('/morning-briefing', aiController.getMorningBriefing);
router.get('/upcoming-meeting-brief', aiController.getUpcomingMeetingBrief);
router.post('/action', aiController.executeAction);
module.exports = router;