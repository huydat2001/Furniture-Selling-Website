const mongoose = require("mongoose");
var mongoose_delete = require("mongoose-delete");

const brandSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    logo: {
      type: String,
      trim: true,
    },

    contactEmail: {
      type: String,
      trim: true,
    },
    contactPhone: {
      type: String,
      trim: true,
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
brandSchema.plugin(mongoose_delete, {
  deletedAt: true,
  overrideMethods: "all",
});
const Brand = mongoose.model("Brand", brandSchema);
module.exports = Brand;
