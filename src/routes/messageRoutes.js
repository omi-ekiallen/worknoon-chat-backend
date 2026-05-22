const express = require('express');
const router = express.Router();
const {
  sendMessage,
  getMessages,
  markAsRead
} = require('../controllers/messageController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/', sendMessage);
router.get('/:conversationId', getMessages);
router.put('/read/:conversationId', markAsRead);

module.exports = router;