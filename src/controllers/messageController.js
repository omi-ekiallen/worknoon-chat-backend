const Message = require('../models/Message');
const Conversation = require('../models/Conversation');

// @desc    Send a message
// @route   POST /api/messages
const sendMessage = async (req, res) => {
  try {
    const { conversationId, content } = req.body;

    const message = await Message.create({
      conversation: conversationId,
      sender: req.user._id,
      content
    });

    // Update last message in conversation
    await Conversation.findByIdAndUpdate(conversationId, {
      lastMessage: message._id,
      updatedAt: Date.now()
    });

    const populated = await Message.findById(message._id)
      .populate('sender', '-password');

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all messages in a conversation
// @route   GET /api/messages/:conversationId
const getMessages = async (req, res) => {
  try {
    const messages = await Message.find({
      conversation: req.params.conversationId
    })
      .populate('sender', '-password')
      .sort({ createdAt: 1 });

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Mark messages as read
// @route   PUT /api/messages/read/:conversationId
const markAsRead = async (req, res) => {
  try {
    await Message.updateMany(
      {
        conversation: req.params.conversationId,
        sender: { $ne: req.user._id },
        isRead: false
      },
      {
        $set: { isRead: true },
        $addToSet: { readBy: req.user._id }
      }
    );

    res.json({ message: 'Messages marked as read' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { sendMessage, getMessages, markAsRead };