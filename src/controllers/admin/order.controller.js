const {
  getOrder,
  createOrder,
  deleteOrder,
  updateOrder,
} = require("../../services/admin/order.service");

module.exports = {
  getOrderAPI: async (req, res) => {
    try {
      let { page, limit } = req.query;
      const result = await getOrder(page, limit, req.query);
      return res.status(200).json({
        data: {
          statusCode: true,
          pagination: result.pagination,
          result: result.result,
        },
      });
    } catch (error) {
      return res.status(500).json({
        statusCode: false,
        error: {
          code: 500,
          message: error.message,
        },
      });
    }
  },
  postCreateOrderAPI: async (req, res) => {
    try {
      const result = await createOrder(req.body);
      if (!result) {
        throw new Error("Không thể tạo đơn hàng");
      }
      return res.status(200).json({
        data: {
          statusCode: true,
          data: result,
        },
      });
    } catch (error) {
      return res.status(400).json({
        statusCode: false,
        error: {
          code: 400,
          message: error.message,
        },
      });
    }
  },
  putUpdateOrderAPI: async (req, res) => {
    try {
      const result = await updateOrder(req.body);
      return res.status(200).json({
        data: {
          statusCode: true,
          result: result,
        },
      });
    } catch (error) {
      return res.status(500).json({
        statusCode: false,
        error: {
          code: 500,
          message: error.message,
        },
      });
    }
  },
  deleteOrderAPI: async (req, res) => {
    try {
      const { id } = req.params;
      const result = await deleteOrder(id);

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
  // cancelOrderAPI: async (req, res) => {
  //   try {
  //     const { orderId } = req.body;
  //     const result = await cancelOrder(orderId);
  //     return res.status(200).json({
  //       data: {
  //         statusCode: true,
  //         result: result,
  //       },
  //     });
  //   } catch (error) {
  //     return res.status(500).json({
  //       success: false,
  //       error: {
  //         code: 500,
  //         message: error.message,
  //       },
  //     });
  //   }
  // },
};
