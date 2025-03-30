const mongoose = require("mongoose");
var mongoose_delete = require("mongoose-delete");
const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account", // Liên kết với tài khoản người dùng
      required: true,
      default: null,
    },
    items: [
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
          default: 1,
        },
      },
    ],
    totalAmount: {
      type: Number, // Tổng tiền của giỏ hàng
      default: 0,
    },
    updatedAt: {
      type: Date, // Thời gian cập nhật giỏ hàng
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);
cartSchema.plugin(mongoose_delete, {
  deletedAt: true,
  overrideMethods: "all",
});
const Cart = mongoose.model("Cart", cartSchema);
module.exports = Cart;
