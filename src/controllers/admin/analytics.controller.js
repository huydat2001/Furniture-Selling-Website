const {
  getTotalMount,
  getTotalOrder,
  getCancellationRate,
  getTotalSoldProducts,
  getProcessingOrders,
  getCurrentCustomers,
  getRevenueByPeriod,
  getOrderCountByCategory,
  getOrderCountByStatus,
} = require("../../services/admin/analytics.service");

module.exports = {
  getTotalMountAPI: async (req, res) => {
    try {
      const { period, startDate, endDate } = req.query;
      const result = await getTotalMount(period, startDate, endDate);
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
  getTotalOrderAPI: async (req, res) => {
    try {
      const { period, startDate, endDate } = req.query;
      const result = await getTotalOrder(period, startDate, endDate);
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
  getCancellationRateAPI: async (req, res) => {
    try {
      const { period, startDate, endDate } = req.query;
      const result = await getCancellationRate(period, startDate, endDate);
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
  getTotalSoldProductsAPI: async (req, res) => {
    try {
      const { period, startDate, endDate } = req.query;
      const result = await getTotalSoldProducts(period, startDate, endDate);
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
  getProcessingOrdersAPI: async (req, res) => {
    try {
      const { period, startDate, endDate } = req.query;
      const result = await getProcessingOrders(period, startDate, endDate);
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
  getCurrentCustomersAPI: async (req, res) => {
    try {
      const { period, startDate, endDate } = req.query;
      const result = await getCurrentCustomers(period, startDate, endDate);
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
  getRevenueByPeriodAPI: async (req, res) => {
    try {
      const { period, startDate, endDate } = req.query;
      const result = await getRevenueByPeriod(period, startDate, endDate);
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
  getOrderCountByStatusAPI: async (req, res) => {
    try {
      const { period, startDate, endDate } = req.query;
      const result = await getOrderCountByStatus(period, startDate, endDate);
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
};
