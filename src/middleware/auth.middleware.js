const jwt = require("jsonwebtoken");

const authenticateToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1]; // Lấy token từ header Authorization
  if (!token) {
    return res.status(401).json({ message: "Không lấy được token" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET); // Xác thực token
    req.user = decoded; // Lưu thông tin user vào req
    next();
  } catch (error) {
    return res.status(403).json({ message: "Token không hợp lệ" });
  }
};
const checkRole = (roles) => {
  return (req, res, next) => {
    const userRole = req.user.role; // Lấy role từ JWT
    if (!roles.includes(userRole)) {
      return res
        .status(403)
        .json({ message: "Bạn không có quyền truy cập vào trang này" });
    }
    next();
  };
};

module.exports = { authenticateToken, checkRole };
