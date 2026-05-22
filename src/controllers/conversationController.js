const Conversation = require('../models/Conversation');
const User = require('../models/User');

// @desc    Create or get a conversation between two users
// @route   POST /api/conversations
const createOrGetConversation = async (req, res) => {
  try {
    const { participantId } = req.body;

    // Check if conversation already exists between these two users
    let conversation = await Conversation.findOne({
      participants: { $all: [req.user._id, participantId] },
      isGroup: false
    }).populate('participants', '-password')
      .populate('lastMessage');

    if (conversation) {
      return res.json(conversation);
    }

    // Create new conversation
    conversation = await Conversation.create({
      participants: [req.user._id, participantId],
      isGroup: false
    });

    conversation = await Conversation.findById(conversation._id)
      .populate('participants', '-password');

    res.status(201).json(conversation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all conversations for logged in user
// @route   GET /api/conversations
const getMyConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({
      participants: { $in: [req.user._id] }
    })
      .populate('participants', '-password')
      .populate('lastMessage')
      .sort({ updatedAt: -1 });

    res.json(conversations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a group conversation
// @route   POST /api/conversations/group
const createGroupConversation = async (req, res) => {
  try {
    const { participantIds, groupName } = req.body;

    const participants = [req.user._id, ...participantIds];

    const conversation = await Conversation.create({
      participants,
      isGroup: true,
      groupName
    });

    const populated = await Conversation.findById(conversation._id)
      .populate('participants', '-password');

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createOrGetConversation,
  getMyConversations,
  createGroupConversation
};