const {
  getAllDiscount,
  createDiscount,
  updateDiscount,
  deleteDiscount,
} = require("../../services/admin/discount.service");

module.exports = {
  getAllDiscountAPI: async (req, res) => {
    try {
      let { page, limit } = req.query;
      const result = await getAllDiscount(page, limit, req.query);
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
  postCreateDiscountAPI: async (req, res) => {
    try {
      const {
        code,
        type,
        value,
        startDate,
        endDate,
        maxUses,
        minOrderValue,
        applicableProducts,
        status,
      } = req.body;
      const data = {
        code,
        type,
        value,
        startDate,
        endDate,
        maxUses,
        minOrderValue,
        applicableProducts,
        status,
      };
      const result = await createDiscount(data);
      if (!result) {
        throw new Error("Không thể tạo mã giảm giá");
      }
      return res.status(201).json({
        data: {
          statusCode: true,
          data: result,
        },
      });
    } catch (error) {
      if (error.message.includes("đã tồn tại")) {
        const errorMessages = error.message.split(", ");
        return res.status(400).json({
          success: false,
          error: {
            code: 400,
            message: errorMessages, // Trả về mảng
          },
        });
      }
      return res.status(400).json({
        success: false,
        error: {
          code: 400,
          message: error.message,
        },
      });
    }
  },
  putUpdateDiscountAPI: async (req, res) => {
    try {
      const {
        id,
        code,
        type,
        value,
        startDate,
        endDate,
        maxUses,
        minOrderValue,
        applicableProducts,
        status,
        isApplicableToAll,
      } = req.body;
      const updateData = {
        id,
        code,
        type,
        value,
        startDate,
        endDate,
        maxUses,
        minOrderValue,
        applicableProducts,
        status,
        isApplicableToAll,
      };
      const result = await updateDiscount(updateData);
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
  deleteDiscountAPI: async (req, res) => {
    try {
      const { id } = req.params;
      const result = await deleteDiscount(id);

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
