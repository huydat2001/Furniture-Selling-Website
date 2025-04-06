const {
  getAllBrand,
  createBrand,
  updateBrand,
  deleteBrand,
} = require("../../services/admin/brand.service");

module.exports = {
  getAllBrandAPI: async (req, res) => {
    try {
      let { page, limit } = req.query;
      const result = await getAllBrand(page, limit, req.query);
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
  postCreateBrandAPI: async (req, res) => {
    try {
      const { name, logo, contactEmail, contactPhone, status } = req.body;
      const data = {
        name,
        logo,
        contactEmail,
        contactPhone,
        status,
      };
      const result = await createBrand(data);
      if (!result) {
        throw new Error("Không thể tạo nhãn hàng");
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
  putUpdateBrandAPI: async (req, res) => {
    try {
      const { id, name, logo, contactEmail, contactPhone, status } = req.body;
      const updateData = {
        id,
        name,
        logo,
        contactEmail,
        contactPhone,
        status,
      };
      const result = await updateBrand(updateData);
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
  deleteBrandAPI: async (req, res) => {
    try {
      const { id } = req.params;
      const result = await deleteBrand(id);

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
};
