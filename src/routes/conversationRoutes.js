const express = require('express');
const router = express.Router();
const {
  createOrGetConversation,
  getMyConversations,
  createGroupConversation
} = require('../controllers/conversationController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/', createOrGetConversation);
router.get('/', getMyConversations);
router.post('/group', createGroupConversation);

module.exports = router;