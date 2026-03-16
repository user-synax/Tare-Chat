const Message = require("../models/Message");
const User = require("../models/User");
const connectDB = require("./db");

// Keep track of online users
const onlineUsers = new Map(); // userId -> socketId

function initSocket(io) {
  io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);

    // Join room when user identifies
    socket.on("join", async (userId) => {
      if (!userId) return;
      socket.join(userId);
      onlineUsers.set(userId, socket.id);
      
      // Notify friends that user is online
      await connectDB();
      const user = await User.findById(userId).populate("friends", "_id");
      if (user && user.friends) {
        user.friends.forEach(friend => {
          const friendSocketId = onlineUsers.get(friend._id.toString());
          if (friendSocketId) {
            io.to(friendSocketId).emit("user_status_change", { userId, status: "online" });
          }
        });
      }
      
      // Send current online friends to the connecting user
      const onlineFriends = [];
      if (user && user.friends) {
        user.friends.forEach(friend => {
          if (onlineUsers.has(friend._id.toString())) {
            onlineFriends.push(friend._id.toString());
          }
        });
      }
      socket.emit("initial_online_status", onlineFriends);
      
      console.log(`User ${userId} joined room`);
    });

    // Messaging
    socket.on("send_message", async (data) => {
      const { senderId, receiverId, text } = data;
      if (!senderId || !receiverId || !text) return;

      try {
        await connectDB();
        const newMessage = await Message.create({
          senderId,
          receiverId,
          text,
        });

        // Emit to receiver and sender
        io.to(receiverId).emit("receive_message", newMessage);
        io.to(senderId).emit("message_sent", newMessage);
      } catch (error) {
        console.error("Socket send_message error:", error);
      }
    });

    // Typing Indicators
    socket.on("typing_start", ({ senderId, receiverId }) => {
      io.to(receiverId).emit("user_typing", { userId: senderId, isTyping: true });
    });

    socket.on("typing_stop", ({ senderId, receiverId }) => {
      io.to(receiverId).emit("user_typing", { userId: senderId, isTyping: false });
    });

    // WebRTC Signaling
    socket.on("call_user", ({ offer, to, from, fromName }) => {
      io.to(to).emit("incoming_call", { offer, from, fromName });
    });

    socket.on("webrtc_answer", ({ answer, to }) => {
      io.to(to).emit("webrtc_answer", { answer });
    });

    socket.on("webrtc_ice_candidate", ({ candidate, to }) => {
      io.to(to).emit("webrtc_ice_candidate", { candidate });
    });

    socket.on("reject_call", ({ to }) => {
      io.to(to).emit("call_rejected");
    });

    socket.on("end_call", ({ to }) => {
      io.to(to).emit("call_ended");
    });

    // Disconnect
    socket.on("disconnect", () => {
      let disconnectedUserId = null;
      for (const [userId, socketId] of onlineUsers.entries()) {
        if (socketId === socket.id) {
          disconnectedUserId = userId;
          onlineUsers.delete(userId);
          break;
        }
      }

      if (disconnectedUserId) {
        // Notify friends user is offline
        io.emit("user_status_change", { userId: disconnectedUserId, status: "offline" });
      }
      console.log("User disconnected:", socket.id);
    });
  });
}

module.exports = { initSocket };
