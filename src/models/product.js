const { required } = require("joi");
const mongoose = require("mongoose");
const mongoose_delete = require("mongoose-delete");
const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
    },
    discount: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Discount", // Liên kết với schema Discount
    },
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
        url: {
          type: String,
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
    sku: {
      type: String,
      trim: true,
      unique: true,
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
