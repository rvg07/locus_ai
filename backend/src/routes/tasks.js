const express = require('express');
const router = express.Router();
const tasksController = require('../controllers/tasksController');
const isAuthenticated = require('../middleware/isAuthenticated');

router.use(isAuthenticated);

router.get('/', tasksController.getAllTasks);
router.post('/', tasksController.createTask);
router.put('/:id', tasksController.updateTask);
router.delete('/:id', tasksController.deleteTask);

module.exports = router;