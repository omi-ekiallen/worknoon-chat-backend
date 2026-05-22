const User = require('../models/User');

module.exports = (io) => {
  // Store online users
  const onlineUsers = new Map();

  io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // User joins with their userId
    socket.on('userOnline', async (userId) => {
      onlineUsers.set(userId, socket.id);
      await User.findByIdAndUpdate(userId, { isOnline: true });

      // Broadcast to everyone that this user is online
      io.emit('onlineUsers', Array.from(onlineUsers.keys()));
    });

    // User joins a conversation room
    socket.on('joinConversation', (conversationId) => {
      socket.join(conversationId);
      console.log(`User joined conversation: ${conversationId}`);
    });

    // User leaves a conversation room
    socket.on('leaveConversation', (conversationId) => {
      socket.leave(conversationId);
      console.log(`User left conversation: ${conversationId}`);
    });

    // New message sent
    socket.on('sendMessage', (message) => {
      // Send message to everyone in the conversation room
      io.to(message.conversation).emit('newMessage', message);
    });

    // Typing indicator
    socket.on('typing', ({ conversationId, userId, userName }) => {
      socket.to(conversationId).emit('userTyping', { userId, userName });
    });

    // Stop typing
    socket.on('stopTyping', ({ conversationId }) => {
      socket.to(conversationId).emit('userStopTyping');
    });

    // User disconnects
    socket.on('disconnect', async () => {
      // Find which user disconnected
      for (let [userId, socketId] of onlineUsers.entries()) {
        if (socketId === socket.id) {
          onlineUsers.delete(userId);
          await User.findByIdAndUpdate(userId, { isOnline: false });
          io.emit('onlineUsers', Array.from(onlineUsers.keys()));
          break;
        }
      }
      console.log('User disconnected:', socket.id);
    });
  });
};