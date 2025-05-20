const Comment = require("../../models/comment");
const Product = require("../../models/product");

module.exports = {
  createComment: async (userId, productId, content, rating) => {
    try {
      // Kiểm tra sản phẩm tồn tại
      const product = await Product.findById(productId);
      if (!product) {
        const error = new Error("Sản phẩm không tồn tại");
        error.statusCode = 404;
        throw error;
      }

      // Tạo comment
      const comment = await Comment.create({
        userId,
        productId,
        content,
        rating,
      });

      // Cập nhật sản phẩm
      try {
        product.comments.push(comment._id);
        product.totalReviews += 1;
        product.ratings = (
          (product.ratings * (product.totalReviews - 1) + rating) /
          product.totalReviews
        ).toFixed(1);
        await product.save();
      } catch (error) {
        // Nếu cập nhật product thất bại, xóa comment vừa tạo
        await Comment.findByIdAndDelete(comment._id);
        const err = new Error("Lỗi khi cập nhật sản phẩm: " + error.message);
        err.statusCode = 500;
        throw err;
      }

      return comment;
    } catch (error) {
      throw new Error(error.message);
    }
  },
  getCommentsByProduct: async (page, limit, productId) => {
    try {
      let result = null;
      let total = null;

      if (limit && page) {
        let offset = (page - 1) * limit;
        result = await Comment.find({ productId })
          .populate("userId", "fullName email") // Lấy thông tin người dùng
          .sort({ createdAt: -1 })
          .skip(offset)
          .limit(limit)
          .exec();
        total = await Comment.countDocuments({ productId });
      } else {
        result = await Comment.find({ productId })
          .populate("userId", "fullName email")
          .sort({ createdAt: -1 })
          .exec();
      }

      return {
        result,
        pagination: {
          current_page: page,
          limit: limit,
          total_pages: limit > 0 ? Math.ceil(total / limit) : 1,
          total: total,
        },
      };
    } catch (error) {
      throw new Error("Lỗi truy vấn dữ liệu: " + error.message);
    }
  },
  deleteComment: async (userId, commentId, isAdmin = false) => {
    try {
      // Tìm comment
      const comment = await Comment.findById(commentId).populate("userId");
      if (!comment) {
        const error = new Error("Bình luận không tồn tại");
        error.statusCode = 404;
        throw error;
      }

      // Kiểm tra quyền xóa
      if (!isAdmin && comment.userId._id.toString() !== userId) {
        const error = new Error("Bạn không có quyền xóa bình luận này");
        error.statusCode = 403;
        throw error;
      }

      const product = await Product.findById(comment.productId);
      if (!product) {
        const error = new Error("Sản phẩm không tồn tại");
        error.statusCode = 404;
        throw error;
      }

      await comment.delete();
      try {
        product.comments = product.comments.filter(
          (id) => id.toString() !== commentId
        );

        product.totalReviews = Math.max(0, product.totalReviews - 1);

        if (product.totalReviews > 0) {
          const remainingComments = await Comment.find({
            productId: product._id,
            deleted: { $ne: true },
          });
          const totalRating = remainingComments.reduce(
            (sum, c) => sum + c.rating,
            0
          );
          product.ratings = (totalRating / product.totalReviews).toFixed(1);
        } else {
          product.ratings = 0;
        }

        await product.save();
      } catch (error) {
        await Comment.restore({ _id: commentId });
        const err = new Error("Lỗi khi cập nhật sản phẩm: " + error.message);
        err.statusCode = 500;
        throw err;
      }

      return { success: true, message: "Xóa bình luận thành công" };
    } catch (error) {
      throw error;
    }
  },
};
