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
      const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px; background-color: #f9f9f9;">
          <div style="text-align: center; padding-bottom: 20px; background-color:#80001C; color:#ffffff; border-radius: 8px 8px 0 0; padding: 20px;">
             <img src="https://api.muji.com.vn/media/logo/stores/1/MUJI_Box-header.png" alt="Logo" style="width: 150px; margin-bottom: 10px;" />
            <h2 style="color: #333; margin: 0;">Xác nhận đăng ký tài khoản</h2>
          </div>
          <div style="background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
            <p style="color: #555; font-size: 16px; line-height: 1.5;">
              Xin chào ${username},<br/><br/>
              Cảm ơn bạn đã đăng ký! Dưới đây là mã xác nhận của bạn:
            </p>
            <div style="text-align: center; margin: 20px 0;">
              <span style="display: inline-block; background-color: #4CAF50; color: white; font-size: 24px; font-weight: bold; padding: 10px 20px; border-radius: 5px;">
                ${verificationToken}
              </span>
            </div>
            <p style="color: #555; font-size: 16px; line-height: 1.5;">
              Mã này sẽ hết hạn sau <strong>10 phút</strong>. Vui lòng sử dụng mã này để hoàn tất đăng ký.
            </p>
          
          </div>
          <div style="text-align: center; padding-top: 20px; color: #999; font-size: 14px;">
            <p>Nếu bạn không đăng ký tài khoản, vui lòng bỏ qua email này.</p>
            <p>© ${new Date().getFullYear()} Nguyễn Huy Đạt.</p>
            <p>Liên hệ: <a href="mailto:nguyenhuydatvp201@gmail.com" style="color: #4CAF50;">nguyenhuydatvp201@gmail.com</a></p>
          </div>
        </div>
      `;
      existingUser.verificationToken = verificationToken;
      existingUser.verificationTokenExpires = verificationTokenExpires;
      existingUser.lastVerificationSent = Date.now();
      await existingUser.save();

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Xác nhận đăng ký tài khoản",
        // text: `Mã xác nhận mới của bạn là: ${verificationToken}. Mã này sẽ hết hạn sau 10 phút.`,
        html: htmlContent,
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
      // text: `Mã xác nhận của bạn là: ${verificationToken}. Mã này sẽ hết hạn sau 10 phút.`,
      html: htmlContent,
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
const generateResetToken = () => {
  return Math.floor(100000 + Math.random() * 900000).toString(); // Mã 6 chữ số
};
const forgotPasswordAPI = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await Account.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Email không tồn tại" });
    }

    // Tạo mã đặt lại mật khẩu
    const resetToken = generateResetToken();
    const resetTokenExpires = Date.now() + 10 * 60 * 1000; // Hết hạn sau 10 phút

    // Lưu mã và thời gian hết hạn vào database
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetTokenExpires;
    await user.save();
    // Gửi email chứa mã đặt lại
    // Tạo nội dung email HTML
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px; background-color: #f9f9f9;">
        <!-- Header -->
       <div style="text-align: center; padding-bottom: 20px; background-color:#80001C; color:#ffffff; border-radius: 8px 8px 0 0; padding: 20px;">
          <img src="https://api.muji.com.vn/media/logo/stores/1/MUJI_Box-header.png" alt="Logo" style="width: 150px; margin-bottom: 10px;" />
          <h2 style="color: #ffffff ; margin: 0;">Yêu cầu đặt lại mật khẩu</h2>
        </div>

        <!-- Body -->
        <div style="background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
          <p style="color: #555; font-size: 16px; line-height: 1.5;">
            Xin chào ${user.username || "Người dùng"},<br/><br/>
            Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn. Dưới đây là mã đặt lại mật khẩu của bạn:
          </p>
          <div style="text-align: center; margin: 20px 0;">
            <span style="display: inline-block; background-color: #4CAF50; color: white; font-size: 24px; font-weight: bold; padding: 10px 20px; border-radius: 5px;">
              ${resetToken}
            </span>
          </div>
          <p style="color: #555; font-size: 16px; line-height: 1.5;">
            Mã này sẽ hết hạn sau <strong>10 phút</strong>. Vui lòng sử dụng mã này để đặt lại mật khẩu của bạn.
          </p>
     
        </div>

        <!-- Footer -->
        <div style="text-align: center; padding-top: 20px; color: #999; font-size: 14px;">
          <p>Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.</p>
          <p>© ${new Date().getFullYear()} Nguyễn Huy Đạt.</p>
          <p>
            Liên hệ: <a href="mailto:nguyenhuydatvp201@gmai.com" style="color: #4CAF50;">nguyenhuydatvp201@gmai.com</a>
          </p>
        </div>
      </div>
    `;
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Yêu cầu đặt lại mật khẩu",
      // text: `Mã đặt lại mật khẩu của bạn là: ${resetToken}. Mã này sẽ hết hạn sau 10 phút.`,
      html: htmlContent,
    };

    await transporter.sendMail(mailOptions);
    return res
      .status(200)
      .json({ success: true, message: "Đã gửi mã đặt lại mật khẩu về email" });
  } catch (error) {
    console.error("Error during forgot password:", error);
    return res
      .status(500)
      .json({ message: "Đã có lỗi xảy ra. Vui lòng thử lại." });
  }
};

// API đặt lại mật khẩu
const resetPasswordAPI = async (req, res) => {
  const { email, token, newPassword } = req.body;
  try {
    const user = await Account.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Email không tồn tại" });
    }

    if (
      user.resetPasswordToken !== token ||
      Date.now() > user.resetPasswordExpires
    ) {
      return res
        .status(400)
        .json({ message: "Mã đặt lại không đúng hoặc đã hết hạn" });
    }

    // Cập nhật mật khẩu mới
    user.password = newPassword; // Middleware pre("save") sẽ tự động mã hóa
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    return res
      .status(200)
      .json({ success: true, message: "Đặt lại mật khẩu thành công" });
  } catch (error) {
    console.error("Error during reset password:", error);
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
  forgotPasswordAPI,
  resetPasswordAPI,
};
