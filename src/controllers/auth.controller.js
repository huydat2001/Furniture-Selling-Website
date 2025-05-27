var jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const Account = require("../models/account");
const { getAccount } = require("../services/admin/user.services");
require("dotenv").config();

const nodemailer = require("nodemailer");
const login = async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await Account.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: "Tài khoản hoặc mật khẩu sai" });
    }

    // Kiểm tra mật khẩu
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Tài khoản hoặc mật khẩu sai" });
    }

    // Tạo JWT
    const accessToken = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_ACCESS_SECRET,
      { expiresIn: process.env.JWT_ACCESS_EXPIRE_IN }
    );
    const refreshToken = jwt.sign(
      { id: user._id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: process.env.JWT_REFRESH_EXPIRE_IN }
    );
    return res.status(200).json({
      statusCode: true,
      message: "Login successful",
      accessToken,
      refreshToken,
      data: user,
    });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};
const refreshToken = (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(401).json({ message: "Không có refresh token" });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    // Tạo Access Token mới
    const accessToken = jwt.sign(
      { id: decoded.id, role: decoded.role },
      process.env.JWT_ACCESS_SECRET,
      { expiresIn: process.env.JWT_ACCESS_EXPIRE_IN }
    );

    return res.status(200).json({
      statusCode: true,
      accessToken,
    });
  } catch (error) {
    return res.status(403).json({ message: "Refresh token không hợp lệ" });
  }
};
const getAccountAPI = async (req, res) => {
  try {
    const user = req.user; // Lấy thông tin người dùng từ token
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const result = await getAccount(user.id);
    if (!result) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }
    return res.status(200).json({
      statusCode: true,
      message: "Lấy tài khoản thành công",
      data: result,
    });
  } catch (error) {}
};
const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});
const createAccountAPI = async (req, res) => {
  const { email, username, password } = req.body;
  try {
    const existingUser = await Account.findOne({
      $or: [{ email }, { username }],
    });
    if (existingUser) {
      if (existingUser.isVerified) {
        return res
          .status(400)
          .json({ message: "Email hoặc username đã tồn tại" });
      }
      // Email đã tồn tại nhưng chưa xác nhận, gửi lại mã
      const verificationToken = Math.floor(
        100000 + Math.random() * 900000
      ).toString();
      const verificationTokenExpires = Date.now() + 10 * 60 * 1000; // Hết hạn sau 10 phút

      existingUser.verificationToken = verificationToken;
      existingUser.verificationTokenExpires = verificationTokenExpires;
      existingUser.lastVerificationSent = Date.now();
      await existingUser.save();

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Xác nhận đăng ký tài khoản",
        text: `Mã xác nhận mới của bạn là: ${verificationToken}. Mã này sẽ hết hạn sau 10 phút.`,
      };

      await transporter.sendMail(mailOptions);
      return res
        .status(200)
        .json({ success: true, message: "Đã gửi lại mã xác nhận về email" });
    }

    // Trường hợp email chưa tồn tại, tạo tài khoản mới

    const verificationToken = Math.floor(
      100000 + Math.random() * 900000
    ).toString();
    const verificationTokenExpires = Date.now() + 10 * 60 * 1000;

    const user = await Account.create({
      email,
      username,
      password: password,
      isVerified: false,
      verificationToken,
      verificationTokenExpires,
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Xác nhận đăng ký tài khoản",
      text: `Mã xác nhận của bạn là: ${verificationToken}. Mã này sẽ hết hạn sau 10 phút.`,
    };

    await transporter.sendMail(mailOptions);
    return res
      .status(200)
      .json({ success: true, message: "Đã gửi mã xác nhận về email" });
  } catch (error) {
    console.error("Error during registration:", error);
    return res
      .status(500)
      .json({ message: "Đã có lỗi xảy ra. Vui lòng thử lại." });
  }
};
const verifyEmailAPI = async (req, res) => {
  const { email, code } = req.body;
  try {
    const user = await Account.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Email không tồn tại" });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: "Tài khoản đã được xác nhận" });
    }

    if (
      user.verificationToken !== code ||
      Date.now() > user.verificationTokenExpires
    ) {
      return res
        .status(400)
        .json({ message: "Mã xác nhận không đúng hoặc đã hết hạn" });
    }

    user.isVerified = true;
    user.verificationToken = null;
    user.verificationTokenExpires = null;
    await user.save();

    return res
      .status(200)
      .json({ success: true, message: "Xác thực thành công" });
  } catch (error) {
    console.error("Error during verification:", error);
    return res
      .status(500)
      .json({ message: "Đã có lỗi xảy ra. Vui lòng thử lại." });
  }
};
module.exports = {
  login,
  refreshToken,
  getAccountAPI,
  createAccountAPI,
  verifyEmailAPI,
};
