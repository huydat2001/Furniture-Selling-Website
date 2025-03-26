const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const accountSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      // required: true,
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    fullName: {
      type: String,
      // required: true,
    },
    address: {
      street: String,
      city: String,
      state: String,
      country: String,
    },
    phone: {
      type: String,
      trim: true,
    },
    role: {
      type: String,
      enum: ["customer", "admin", "staff"],
      default: "customer",
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationToken: {
      type: String,
      default: null,
    },
    resetPasswordToken: {
      type: String,
      default: null,
    },
    resetPasswordExpires: {
      type: Date,
      default: null,
    },
    lastLogin: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);
accountSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});
const Account = mongoose.model("Account", accountSchema);
module.exports = Account;
