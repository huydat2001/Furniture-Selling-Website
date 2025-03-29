var jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const Account = require("../models/account");

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
module.exports = { login, refreshToken };
