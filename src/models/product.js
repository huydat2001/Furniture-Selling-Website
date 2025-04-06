const mongoose = require("mongoose");
const mongoose_delete = require("mongoose-delete");
const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: true,
      unique: true,
    },
    description: {
      type: String,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
    },
    discounts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Discount", // Danh sách các Discount áp dụng cho sản phẩm
        default: [], // Mặc định là mảng rỗng nếu không có discount nào
      },
    ],
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    stock: {
      type: Number,
      default: 0,
      required: true,
    },
    images: [
      {
        name: {
          type: String,
          trim: true,
        },
        public_id: {
          type: String,
        },
      },
    ],
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
    brand: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Brand",
    },
    ratings: {
      type: Number,
      default: 0,
    },
    reviews: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Account",
        },
        rating: {
          type: Number,
        },
        comment: {
          type: String,
          trim: true,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    dimensions: {
      length: { type: Number },
      width: { type: Number },
      height: { type: Number },
    },
    weight: {
      type: Number,
    },
    material: {
      type: String,
      trim: true,
    },
    color: {
      type: String,
      trim: true,
    },

    isFeatured: {
      type: Boolean, // Sản phẩm nổi bật
      default: false,
    },
    sold: {
      type: Number, // Số lượng đã bán
      default: 0, // Mặc định là 0
    },
  },
  {
    timestamps: true, // Tự động cập nhật createdAt và updatedAt
  }
);
productSchema.plugin(mongoose_delete, {
  deletedAt: true,
  overrideMethods: "all",
});
const Product = mongoose.model("Product", productSchema);
module.exports = Product;
