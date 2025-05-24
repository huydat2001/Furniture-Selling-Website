const mongoose = require("mongoose");
const messageSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
      required: true,
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account", // Tham chiếu đến tài khoản nhận (nhân viên hoặc null nếu trong hàng chờ)
      default: null,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },

    status: {
      type: String,
      enum: ["pending", "assigned", "processed", "queued"],
      default: "pending", // pending: chờ xử lý, assigned: đã giao cho nhân viên, processed: đã xử lý, queued: trong hàng chờ
    },

    isRead: {
      type: Boolean,
      default: false,
    },
    assignedAt: {
      type: Date,
      default: null,
    },
    processedAt: {
      type: Date,
      default: null,
    },
    queuePosition: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);
const Message = mongoose.model("Message", messageSchema);
module.exports = Message;
