const Account = require("../../models/account");
const Message = require("../../models/message");

let previousClients = [];

const getMessages = async (req, res) => {
  try {
    const receiver = await Account.findOne({ username: req.params.receiver });
    if (!receiver) {
      return res.status(404).json({ error: "Receiver not found" });
    }
    const messages = await Message.find({ receiverId: receiver._id })
      .populate("senderId", "username fullName")
      .populate("receiverId", "username fullName")
      .sort({ timestamp: -1 });

    res.status(200).json(messages);
  } catch (error) {
    console.log("Lỗi trong getMessage controller:", error.message);
    res.status(500).json({ error: "Không thể kết nối với server" });
  }
};

const getAllMessages = async (req, res) => {
  try {
    const messages = await Message.find()
      .populate("senderId", "username fullName")
      .populate("receiverId", "username fullName")
      .sort({ timestamp: 1 });
    res.status(200).json(messages);
  } catch (error) {
    console.log("Lỗi trong getAllMessages controller:", error.message);
    res.status(500).json({ error: "Không thể kết nối với server" });
  }
};
const unreadMessage = async (req, res) => {
  try {
    const receiver = await Account.findOne({ username: req.params.receiver });
    if (!receiver) {
      return res.status(404).json({ error: "Receiver not found" });
    }
    const count = await Message.countDocuments({
      receiverId: receiver._id,
      isRead: false,
    });
    res.status(200).json(count);
  } catch (error) {
    console.log("Lỗi trong getMessage controller:", error.message);
    res.status(500).json({ error: "Không thể kết nối với server" });
  }
};
const sendMessage = async (req, res) => {
  try {
    const content = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;
    const newMessage = new Message({
      senderId,
      receiverId,
      content,
    });
    await newMessage.save();
    res.status(201).json(newMessage);
  } catch (error) {
    console.log(" error in sendMessage controller : ", error.message);
    res.status(500).json({ error: "không thể kết nối với server" });
  }
};
module.exports = {
  getMessages,
  sendMessage,
  getAllMessages,
  unreadMessage,
};
