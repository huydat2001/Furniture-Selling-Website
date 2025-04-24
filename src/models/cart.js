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
        selectedColor: {
          type: String,
          required: false,
        },
      },
    ],
    totalAmount: {
      type: Number, // Tổng tiền của giỏ hàng
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);
// Tự động tính totalAmount trước khi lưu
cartSchema.pre("save", async function (next) {
  try {
    await this.populate({
      path: "items.product",
      select: "price decreases",
    });

    // Lọc bỏ các sản phẩm không tồn tại
    this.items = this.items.filter((item) => item.product);

    this.totalAmount = this.items.reduce((total, item) => {
      const productPrice = item.product.price || 0;
      const discountedPrice = item.product.decreases || 0;
      const priceToUse =
        discountedPrice !== 0
          ? productPrice - (productPrice * discountedPrice) / 100
          : productPrice;
      return total + priceToUse * item.quantity;
    }, 0);

    next();
  } catch (error) {
    next(error);
  }
});
cartSchema.plugin(mongoose_delete, {
  deletedAt: true,
  overrideMethods: "all",
});
const Cart = mongoose.model("Cart", cartSchema);
module.exports = Cart;
