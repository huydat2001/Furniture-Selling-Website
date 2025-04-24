const mongoose = require("mongoose");
var mongoose_delete = require("mongoose-delete");

const vnpayTransactionSchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    txnRef: {
      type: String,
      required: true,
      unique: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    orderInfo: {
      type: String,
    },
    transactionNo: {
      type: String,
    },
    bankCode: {
      type: String,
    },
    cardType: {
      type: String,
    },
    payDate: {
      type: Date,
    },
    responseCode: {
      type: String,
    },
    secureHash: {
      type: String,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "success", "failed"],
      default: "pending",
    },
  },
  { timestamps: true }
);
vnpayTransactionSchema.plugin(mongoose_delete, {
  deletedAt: true,
  overrideMethods: "all",
});
const VnpayTransaction = mongoose.model(
  "VnpayTransaction",
  vnpayTransactionSchema
);
module.exports = VnpayTransaction;
