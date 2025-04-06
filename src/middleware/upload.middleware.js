const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Tạo thư mục nếu chưa tồn tại
const createFolderIfNotExists = (folderPath) => {
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
  }
};

// Cấu hình multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const folder = req.headers[`folder`] || "default"; // Lấy folder từ request header hoặc mặc định là "default"
    const uploadPath = path.join("./src", `public/images/${folder}`);

    createFolderIfNotExists(uploadPath); // Tạo thư mục nếu chưa tồn tại
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname); // Lấy phần mở rộng của file
    const fileName = `${Date.now()}-${file.originalname}${ext}`; // Đặt tên file theo timestamp
    cb(null, fileName);
  },
});

// Kiểm tra loại file
const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Chỉ cho phép upload file ảnh (jpeg, png, jpg)"));
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // Giới hạn kích thước file 5MB
});

// module.exports = upload;
module.exports = {
  uploadSingle: upload.single("image"), // Middleware cho upload 1 file
  uploadMultiple: upload.array("images", 10), // Middleware cho upload nhiều file
};
