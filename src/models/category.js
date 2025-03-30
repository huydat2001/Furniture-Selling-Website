const mongoose = require("mongoose");
var mongoose_delete = require("mongoose-delete");

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    description: {
      type: String,
      trim: true,
    },
    parent: {
      // Hỗ trợ danh mục phân cấp (cha/con)
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      default: null, // null nếu là danh mục gốc
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  {
    timestamps: true,
  }
);
categorySchema.plugin(mongoose_delete, {
  deletedAt: true,
  overrideMethods: "all",
});
const Category = mongoose.model("Category", categorySchema);
module.exports = Category;
