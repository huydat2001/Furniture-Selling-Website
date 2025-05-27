require("dotenv").config();
const express = require("express");
const cors = require("cors");
const configViewEngine = require("./config/viewEngine");
const apiRoutes = require("./routes/api");
const connection = require("./config/database");
var jwt = require("jsonwebtoken");
const app = express();

const { Server } = require("socket.io");
const http = require("http");
const server = http.createServer(app);
const { initializeDefaultAccounts } = require("./utils/add.account");
const { initializeSocket } = require("./config/socket.handler");
const Message = require("./models/message");
const Account = require("./models/account");

const port = process.env.PORT || 8000;
const hostname = process.env.HOST_NAME;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
configViewEngine(app);

const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",")
  : ["http://localhost:3000"];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization", "folder"],
  })
);

const socketIo = require("socket.io")(server, {
  cors: {
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
    methods: ["GET", "POST"],
  },
});
socketIo.use((socket, next) => {
  const token = socket.handshake.auth.token;

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
      socket.user = decoded;
      next();
    } catch (err) {
      console.error("JWT verification error:", err.message);
      next(new Error("Authentication error"));
    }
  } else {
    console.error("No token provided");
    next(new Error("Authentication error"));
  }
});

socketIo.on("connection", (socket) => {
  socket.on("sendMessage", async (msg) => {
    const sender = await Account.findOne({ username: msg.sender });
    const receiver = await Account.findOne({ username: msg.receiver });
    if (!sender || !receiver) {
      socket.emit("error", { message: "Invalid sender or receiver" });
      return;
    }
    const newMessage = new Message({
      senderId: sender._id,
      receiverId: receiver._id,
      content: msg.content,
      timestamp: new Date(),
      isRead: false,
    });
    await newMessage.save();

    const populatedMessage = await Message.findById(newMessage._id)
      .populate("senderId", "username fullName")
      .populate("receiverId", "username fullName");

    // Gửi cả object populated và chuỗi username
    socketIo.emit("receiveMessage", {
      ...populatedMessage.toObject(),
      sender: sender.username,
      receiver: receiver.username,
    });
  });
  socket.on("markAsRead", async ({ messageId }) => {
    await Message.findByIdAndUpdate(messageId, { isRead: true });
    socketIo.emit("messageRead", { messageId });
  });

  socket.on("disconnect", () => {
    console.log("WebSocket disconnected:", socket.id);
  });
});

app.use("/v1/api/", apiRoutes);

(async () => {
  try {
    await connection();
    await initializeDefaultAccounts();
    server.listen(port, hostname, () => {
      console.log(`Example app listening on port ${port}`);
    });
  } catch (error) {
    console.log("error connect to server:>> ", error);
  }
})();
