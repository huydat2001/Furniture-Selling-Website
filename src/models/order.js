const mongoose = require("mongoose");
var mongoose_delete = require("mongoose-delete");
const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account", // Liên kết với tài khoản người dùng
      required: true,
    },

    products: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product", // Liên kết với sản phẩm
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
        price: {
          type: Number, // Giá tại thời điểm mua
          required: true,
        },
      },
    ],
    totalAmount: {
      type: Number, // Tổng số tiền của đơn hàng
      required: true,
    },

    shippingAddress: {
      fullName: { type: String, trim: true }, // Tên người nhận
      phone: { type: String, trim: true }, // Số điện thoại
      street: { type: String, trim: true }, // Địa chỉ cụ thể
      city: { type: String, trim: true }, // Tỉnh/thành
      state: { type: String, trim: true }, // Quận/huyện
    },
    paymentMethod: {
      type: String, // Phương thức thanh toán
      enum: ["cod", "bank_card"], // Tiền mặt, thẻ, PayPal
      default: "cod",
    },

    status: {
      type: String,
      enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
      default: "pending",
    },
    orderDate: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);
orderSchema.plugin(mongoose_delete, {
  deletedAt: true,
  overrideMethods: "all",
});
const Order = mongoose.model("Order", orderSchema);
module.exports = Order;
