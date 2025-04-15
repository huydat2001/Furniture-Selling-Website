const {
  getAllProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductByQuyery,
} = require("../../services/admin/product.service");

module.exports = {
  getAllProductAPI: async (req, res) => {
    try {
      let { page, limit } = req.query;
      const result = await getAllProduct(page, limit, req.query);
      return res.status(200).json({
        data: {
          statusCode: true,
          pagination: result.pagination,
          result: result.result,
        },
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: {
          code: 500,
          message: error.message,
        },
      });
    }
  },
  postCreateProductAPI: async (req, res) => {
    try {
      const result = await createProduct(req.body);
      if (!result) {
        throw new Error("Không thể tạo sản phẩm");
      }
      return res.status(201).json({
        data: {
          statusCode: true,
          data: result,
        },
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: {
          code: 400,
          message: error.message,
        },
      });
    }
  },
  putUpdateProductAPI: async (req, res) => {
    try {
      const result = await updateProduct(req.body);
      return res.status(200).json({
        data: {
          statusCode: true,
          result: result,
        },
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: {
          code: 500,
          message: error.message,
        },
      });
    }
  },
  deleteProductAPI: async (req, res) => {
    try {
      const { id } = req.params;
      const result = await deleteProduct(id);

      return res.status(200).json({
        data: {
          statusCode: true,
          result: result,
        },
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: {
          code: 500,
          message: error.message,
        },
      });
    }
  },
  getProductByQuyeryAPI: async (req, res) => {
    try {
      let { page, limit } = req.query;
      const result = await getProductByQuyery(page, limit, req.query);
      return res.status(200).json({
        data: {
          statusCode: true,
          pagination: result.pagination,
          result: result.result,
        },
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: {
          code: 500,
          message: error.message,
        },
      });
    }
  },
};
