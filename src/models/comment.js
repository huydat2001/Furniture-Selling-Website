const mongoose = require("mongoose");
var mongoose_delete = require("mongoose-delete");

const commentSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
      required: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      default: 5,
    },
  },
  {
    timestamps: true,
  }
);
commentSchema.plugin(mongoose_delete, {
  deletedAt: true,
  overrideMethods: "all",
});
const Comment = mongoose.model("Comment", commentSchema);
module.exports = Comment;
