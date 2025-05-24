// config/socketHandler.js
const {
  updateClientList,
  assignMessageToStaff,
  sendMessage,
  getClientList,
} = require("../controllers/user/socket.controller");
const Account = require("../models/account");
const Message = require("../models/message");

const handleSocketConnection = (socketIo, socket) => {
  console.log("New client connected: " + socket.id);
  socket.emit("getId", socket.id);

  // Cập nhật danh sách client khi có client mới
  updateClientList(socketIo);

  // Xử lý khi nhân viên kết nối, cập nhật socketId và status
  socket.on("setUserStatus", async (userData) => {
    const { userId, statusE } = userData;

    console.log("Received setUserStatus:", { userId, statusE });
    const updatedAccount = await Account.findByIdAndUpdate(
      userId,
      {
        socketId: socket.id,
        statusE,
      },
      { new: true }
    );
    console.log("Updated account:", updatedAccount);
    updateClientList(socketIo);
  });

  // Xử lý gửi tin nhắn từ khách hàng
  socket.on("sendMessage", async (data) => {
    const { content, productId, senderId } = data;
    const message = new Message({
      senderId,
      productId,
      content,
      status: "pending",
    });
    await message.save();
    const sender = await Account.findById(senderId);
    if (sender && sender.socketId) {
      socketIo.to(sender.socketId).emit("messageSent", {
        _id: message._id,
        senderId: message.senderId,
        content: message.content,
        status: message.status,
        createdAt: message.createdAt,
      }); // Gửi toàn bộ thông tin tin nhắn
    }
    assignMessageToStaff(socketIo, message._id);
  });

  // Xử lý khi nhân viên nhận tin nhắn
  socket.on("messageProcessed", async (messageId) => {
    const message = await Message.findById(messageId);
    if (message) {
      message.status = "processed";
      message.processedAt = new Date();
      await message.save();
      socketIo.emit("messageProcessed", { messageId });
    }
  });

  // Xử lý ngắt kết nối
  socket.on("disconnect", () => {
    console.log("Client disconnected");
    Account.findOneAndUpdate(
      { socketId: socket.id },
      { socketId: null, statusE: "offline", lastStatusUpdate: Date.now() }
    );
    updateClientList(socketIo);
  });
};

const initializeSocket = (socketIo) => {
  socketIo.on("connection", (socket) => {
    handleSocketConnection(socketIo, socket);
  });
};

module.exports = {
  initializeSocket,
};
