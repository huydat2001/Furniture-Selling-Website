const Account = require("../../models/account");
const Message = require("../../models/message");

let previousClients = [];

const getClientList = (socketIo) => {
  return Array.from(socketIo.sockets.sockets.keys());
};

const updateClientList = (socketIo) => {
  const clients = getClientList(socketIo);
  if (JSON.stringify(clients) !== JSON.stringify(previousClients)) {
    socketIo.emit("clientList", clients);
    previousClients = clients;
  }
};

const assignMessageToStaff = async (socketIo, messageId) => {
  const message = await Message.findById(messageId).lean();
  if (!message || message.status !== "pending") return;

  const onlineStaff = await Account.find({
    role: "staff",
    statusE: "online",
    status: "active",
  });
  console.log(
    "Online staff found at",
    new Date().toISOString(),
    ":",
    onlineStaff
  );

  if (onlineStaff.length > 0) {
    const availableStaff = onlineStaff[0];
    if (availableStaff && availableStaff.socketId) {
      message.receiverId = availableStaff._id;
      message.status = "assigned";
      message.assignedAt = new Date();
      await Message.findByIdAndUpdate(messageId, message);
      // Gửi đến staff
      socketIo.to(availableStaff.socketId).emit("newMessage", message);
      // Gửi đến sender (customer)
      const sender = await Account.findById(message.senderId);
      if (sender && sender.socketId) {
        socketIo.to(sender.socketId).emit("messageSent", message);
      }
      socketIo.emit("messageAssigned", {
        messageId,
        staffId: availableStaff._id,
      });
    } else {
      message.status = "queued";
      message.queuePosition = await getQueuePosition();
      await Message.findByIdAndUpdate(messageId, message);
      socketIo.emit("messageQueued", {
        messageId,
        queuePosition: message.queuePosition,
        content: message.content,
      });
      const sender = await Account.findById(message.senderId);
      if (sender && sender.socketId) {
        socketIo.to(sender.socketId).emit("messageSent", message);
      }
    }
  } else {
    message.status = "queued";
    message.queuePosition = await getQueuePosition();
    await Message.findByIdAndUpdate(messageId, message);
    socketIo.emit("messageQueued", {
      messageId,
      queuePosition: message.queuePosition,
      content: message.content,
    });
    const sender = await Account.findById(message.senderId);
    if (sender && sender.socketId) {
      socketIo.to(sender.socketId).emit("messageSent", message);
    }
  }
};

const getQueuePosition = async () => {
  const queuedMessages = await Message.find({ status: "queued" }).sort(
    "queuePosition"
  );
  return queuedMessages.length + 1;
};

const sendMessage = (socket, data) => {
  if (data.recipientId) {
    socket.to(data.recipientId).emit("sendDataServer", {
      content: data.content,
      id: socket.id,
    });
    socket.emit("sendDataServer", {
      content: data.content,
      id: socket.id,
    });
  } else {
    console.error("Recipient ID is missing:", data);
  }
};

module.exports = {
  getClientList,
  updateClientList,
  assignMessageToStaff,
  getQueuePosition,
  sendMessage,
};
