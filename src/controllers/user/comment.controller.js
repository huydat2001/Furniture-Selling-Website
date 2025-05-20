const {
  createComment,
  getCommentsByProduct,
  deleteComment,
} = require("../../services/user/comment.service");

module.exports = {
  createCommentAPI: async (req, res) => {
    try {
      const userId = req.user.id;
      const { productId, content, rating } = req.body;
      const result = await createComment(userId, productId, content, rating);
      return res.status(201).json({
        data: {
          statusCode: true,
          result: result,
        },
      });
    } catch (error) {
      return res.status(error.statusCode || 500).json({
        success: false,
        error: {
          code: error.statusCode || 500,
          message: error.message,
        },
      });
    }
  },
  getCommentsByProductAPI: async (req, res) => {
    try {
      let { page, limit, productId } = req.query;

      const result = await getCommentsByProduct(page, limit, productId);
      return res.status(200).json({
        data: {
          statusCode: true,
          pagination: result.pagination,
          result: result.result,
        },
      });
    } catch (error) {
      return res.status(error.statusCode || 500).json({
        success: false,
        error: {
          code: error.statusCode || 500,
          message: error.message,
        },
      });
    }
  },
  deleteCommentAPI: async (req, res) => {
    try {
      const userId = req.user.id;
      const isAdmin = req.user.role === "admin";
      const { commentId } = req.params;

      const result = await deleteComment(userId, commentId, isAdmin);
      return res.status(200).json({
        data: {
          statusCode: true,
          message: result.message,
        },
      });
    } catch (error) {
      return res.status(error.statusCode || 500).json({
        success: false,
        error: {
          code: error.statusCode || 500,
          message: error.message,
        },
      });
    }
  },
};
