require("dotenv").config();
const express = require("express");
const cors = require("cors");
const configViewEngine = require("./config/viewEngine");
const apiRoutes = require("./routes/api");
const connection = require("./config/database");
const app = express();

const { Server } = require("socket.io");
const http = require("http");
const server = http.createServer(app);
const { initializeDefaultAccounts } = require("./utils/add.account");
const { initializeSocket } = require("./config/socket.handler");
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

initializeSocket(socketIo);
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
