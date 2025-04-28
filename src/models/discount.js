const { number } = require("joi");
const mongoose = require("mongoose");
const mongoose_delete = require("mongoose-delete");

const discountSchema = new mongoose.Schema(
  {
    code: {
      type: String, // Mã giảm giá (ví dụ: "SALE20")
      trim: true,
      unique: true,
      required: true,
    },
    type: {
      type: String, // Loại giảm giá: "percentage" hoặc "fixed"
      enum: ["percentage", "fixed"],
      default: "percentage",
    },
    value: {
      type: Number, // Giá trị giảm (ví dụ: 20 nếu là 20%, hoặc 50000 nếu là 50k)
      required: true,
    },
    maxDiscountAmount: {
      type: Number,
      default: null,
    },
    startDate: {
      type: Date, // Ngày bắt đầu áp dụng
      default: Date.now,
    },
    endDate: {
      type: Date, // Ngày hết hạn\
      default: null,
    },
    maxUses: {
      type: Number, // Số lần sử dụng tối đa
      default: Number.MAX_SAFE_INTEGER,
    },
    usedCount: {
      type: Number, // Số lần đã sử dụng
      default: 0,
    },
    minOrderValue: {
      type: Number, // Giá trị đơn hàng tối thiểu để áp dụng
      default: 0,
    },
    applicableProducts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product", // Danh sách sản phẩm áp dụng giảm giá
      },
    ],
    isApplicableToAll: {
      type: Boolean,
      default: true, // Mặc định áp dụng cho tất cả sản phẩm
    },
    status: {
      type: String,
      enum: ["active", "inactive", "expired"],
      default: "active",
    },
  },
  {
    timestamps: true,
  }
);

discountSchema.plugin(mongoose_delete, {
  deletedAt: true,
  overrideMethods: "all",
});

const Discount = mongoose.model("Discount", discountSchema);
module.exports = Discount;
