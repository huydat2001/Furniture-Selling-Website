const postUploadSingleFileAPI = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng gửi một file ảnh",
      });
    }
    const folder = req.headers[`folder`] || "default";
    const filePath = `/images/${folder}/${req.file.filename}`;
    return res.status(200).json({
      success: true,
      message: "Upload thành công",
      data: {
        filePath: filePath,
        fileName: req.file.filename,
      },
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
const postUploadMultipleFilesAPI = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng chọn ít nhất một file để upload",
      });
    }
    const folder = req.headers[`folder`] || "default";

    // Tạo danh sách đường dẫn file
    const filePaths = req.files.map(
      (file) => `/images/${folder}/${file.filename}`
    );

    return res.status(200).json({
      success: true,
      message: "Upload nhiều file thành công",
      filePaths: filePaths, // Trả về mảng các đường dẫn
      fileName: req.file.filename,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = { postUploadSingleFileAPI, postUploadMultipleFilesAPI };
