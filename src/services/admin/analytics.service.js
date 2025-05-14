const Account = require("../../models/account");
const Order = require("../../models/order");

module.exports = {
  getTotalMount: async (period, startDate, endDate) => {
    try {
      let startDateObj, endDateObj;
      if (startDate && endDate) {
        startDateObj = new Date(startDate);
        endDateObj = new Date(endDate);
      } else if (period) {
        const now = new Date();
        switch (period) {
          case "day":
            startDateObj = new Date(
              now.getFullYear(),
              now.getMonth(),
              now.getDate(),
              0,
              0,
              0,
              0
            );
            endDateObj = new Date(
              now.getFullYear(),
              now.getMonth(),
              now.getDate(),
              23,
              59,
              59,
              999
            );
            break;
          case "month":
            startDateObj = new Date(now.getFullYear(), now.getMonth(), 1);
            endDateObj = new Date(
              now.getFullYear(),
              now.getMonth() + 1,
              0,
              23,
              59,
              59,
              999
            );
            break;
          case "year":
            startDateObj = new Date(now.getFullYear(), 0, 1);
            endDateObj = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
            break;
          default:
            throw new Error("Invalid period value");
        }
      } else {
        const now = new Date();
        startDateObj = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate(),
          0,
          0,
          0,
          0
        );
        endDateObj = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate(),
          23,
          59,
          59,
          999
        );
      }

      // Xác thực ngày
      if (startDateObj > endDateObj) {
        throw new Error("Ngày bắt đầu phải nhỏ hơn hoặc bằng ngày cuối cùng");
      }
      if (isNaN(startDateObj) || isNaN(endDateObj)) {
        throw new Error("Invalid date format");
      }

      // Lọc đơn hàng
      const orderFilter = {
        createdAt: {
          $gte: startDateObj,
          $lte: endDateObj,
        },
        status: "delivered", // Chỉ tính doanh thu từ đơn hàng đã giao
      };

      // Tính tổng doanh thu hiện tại
      const currentRevenueAggregation = await Order.aggregate([
        { $match: orderFilter },
        { $group: { _id: null, totalRevenue: { $sum: "$totalAmount" } } },
      ]);
      const totalRevenue = currentRevenueAggregation[0]?.totalRevenue || 0;

      // Tính tổng doanh thu của khoảng thời gian trước đó
      let previousStartDate, previousEndDate;
      if (startDate && endDate) {
        const diffMs = endDateObj - startDateObj;
        previousStartDate = new Date(startDateObj - diffMs);
        previousEndDate = new Date(startDateObj - 1);
      } else {
        switch (period) {
          case "day":
            previousStartDate = new Date(startDateObj);
            previousStartDate.setDate(startDateObj.getDate() - 1);
            previousEndDate = new Date(endDateObj);
            previousEndDate.setDate(endDateObj.getDate() - 1);
            break;
          case "month":
            previousStartDate = new Date(startDateObj);
            previousStartDate.setMonth(startDateObj.getMonth() - 1);
            previousEndDate = new Date(endDateObj);
            previousEndDate.setMonth(endDateObj.getMonth() - 1);
            break;
          case "year":
            previousStartDate = new Date(startDateObj);
            previousStartDate.setFullYear(startDateObj.getFullYear() - 1);
            previousEndDate = new Date(endDateObj);
            previousEndDate.setFullYear(endDateObj.getFullYear() - 1);
            break;
        }
      }

      const previousOrderFilter = {
        createdAt: {
          $gte: previousStartDate,
          $lte: previousEndDate,
        },
        status: "delivered",
      };

      const previousRevenueAggregation = await Order.aggregate([
        { $match: previousOrderFilter },
        { $group: { _id: null, totalRevenue: { $sum: "$totalAmount" } } },
      ]);
      const previousTotalRevenue =
        previousRevenueAggregation[0]?.totalRevenue || 0;

      // Tính sự khác biệt (diff)
      const revenueDiff =
        previousTotalRevenue > 0
          ? ((totalRevenue - previousTotalRevenue) / previousTotalRevenue) * 100
          : totalRevenue > 0
          ? 100
          : 0;

      return {
        value: totalRevenue,
        diff: revenueDiff.toFixed(2), // Trả về diff dưới dạng phần trăm với 2 chữ số thập phân
      };
    } catch (error) {
      throw new Error("Lỗi truy vấn dữ liệu tổng doanh thu: " + error.message);
    }
  },
  getTotalOrder: async (period, startDate, endDate) => {
    try {
      let startDateObj, endDateObj;
      if (startDate && endDate) {
        startDateObj = new Date(startDate);
        endDateObj = new Date(endDate);
      } else if (period) {
        const now = new Date();
        switch (period) {
          case "day":
            startDateObj = new Date(
              now.getFullYear(),
              now.getMonth(),
              now.getDate(),
              0,
              0,
              0,
              0
            );
            endDateObj = new Date(
              now.getFullYear(),
              now.getMonth(),
              now.getDate(),
              23,
              59,
              59,
              999
            );
            break;
          case "month":
            startDateObj = new Date(now.getFullYear(), now.getMonth(), 1);
            endDateObj = new Date(
              now.getFullYear(),
              now.getMonth() + 1,
              0,
              23,
              59,
              59,
              999
            );
            break;
          case "year":
            startDateObj = new Date(now.getFullYear(), 0, 1);
            endDateObj = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
            break;
          default:
            throw new Error("Invalid period value");
        }
      } else {
        const now = new Date();
        startDateObj = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate(),
          0,
          0,
          0,
          0
        );
        endDateObj = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate(),
          23,
          59,
          59,
          999
        );
      }

      // Xác thực ngày
      if (startDateObj > endDateObj) {
        throw new Error("Ngày bắt đầu phải nhỏ hơn hoặc bằng ngày cuối cùng");
      }
      if (isNaN(startDateObj) || isNaN(endDateObj)) {
        throw new Error("Invalid date format");
      }

      // Lọc đơn hàng (không giới hạn status, tính tất cả đơn hàng)
      const orderFilter = {
        createdAt: {
          $gte: startDateObj,
          $lte: endDateObj,
        },
      };

      // Tính tổng số đơn hàng hiện tại
      const totalOrders = await Order.countDocuments(orderFilter);

      // Tính tổng số đơn hàng của khoảng thời gian trước đó
      let previousStartDate, previousEndDate;
      if (startDate && endDate) {
        const diffMs = endDateObj - startDateObj;
        previousStartDate = new Date(startDateObj - diffMs);
        previousEndDate = new Date(startDateObj - 1);
      } else {
        switch (period) {
          case "day":
            previousStartDate = new Date(startDateObj);
            previousStartDate.setDate(startDateObj.getDate() - 1);
            previousEndDate = new Date(endDateObj);
            previousEndDate.setDate(endDateObj.getDate() - 1);
            break;
          case "month":
            previousStartDate = new Date(startDateObj);
            previousStartDate.setMonth(startDateObj.getMonth() - 1);
            previousEndDate = new Date(endDateObj);
            previousEndDate.setMonth(endDateObj.getMonth() - 1);
            break;
          case "year":
            previousStartDate = new Date(startDateObj);
            previousStartDate.setFullYear(startDateObj.getFullYear() - 1);
            previousEndDate = new Date(endDateObj);
            previousEndDate.setFullYear(endDateObj.getFullYear() - 1);
            break;
        }
      }

      const previousOrderFilter = {
        createdAt: {
          $gte: previousStartDate,
          $lte: previousEndDate,
        },
      };

      const previousTotalOrders = await Order.countDocuments(
        previousOrderFilter
      );

      // Tính sự khác biệt (diff)
      const ordersDiff =
        previousTotalOrders > 0
          ? ((totalOrders - previousTotalOrders) / previousTotalOrders) * 100
          : totalOrders > 0
          ? 100
          : 0;

      return {
        value: totalOrders,
        diff: ordersDiff.toFixed(2), // Trả về diff dưới dạng phần trăm với 2 chữ số thập phân
      };
    } catch (error) {
      throw new Error(
        "Lỗi truy vấn dữ liệu tổng số đơn hàng: " + error.message
      );
    }
  },
  getCancellationRate: async (period, startDate, endDate) => {
    try {
      let startDateObj, endDateObj;
      if (startDate && endDate) {
        startDateObj = new Date(startDate);
        endDateObj = new Date(endDate);
      } else if (period) {
        const now = new Date();
        switch (period) {
          case "day":
            startDateObj = new Date(
              now.getFullYear(),
              now.getMonth(),
              now.getDate(),
              0,
              0,
              0,
              0
            );
            endDateObj = new Date(
              now.getFullYear(),
              now.getMonth(),
              now.getDate(),
              23,
              59,
              59,
              999
            );
            break;
          case "month":
            startDateObj = new Date(now.getFullYear(), now.getMonth(), 1);
            endDateObj = new Date(
              now.getFullYear(),
              now.getMonth() + 1,
              0,
              23,
              59,
              59,
              999
            );
            break;
          case "year":
            startDateObj = new Date(now.getFullYear(), 0, 1);
            endDateObj = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
            break;
          default:
            throw new Error("Invalid period value");
        }
      } else {
        const now = new Date();
        startDateObj = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate(),
          0,
          0,
          0,
          0
        );
        endDateObj = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate(),
          23,
          59,
          59,
          999
        );
      }

      // Xác thực ngày
      if (startDateObj > endDateObj) {
        throw new Error("Ngày bắt đầu phải nhỏ hơn hoặc bằng ngày cuối cùng");
      }
      if (isNaN(startDateObj) || isNaN(endDateObj)) {
        throw new Error("Invalid date format");
      }

      // Lọc đơn hàng
      const orderFilter = {
        createdAt: {
          $gte: startDateObj,
          $lte: endDateObj,
        },
      };

      // Đếm tổng số đơn hàng
      const totalOrders = await Order.countDocuments(orderFilter);

      // Đếm số đơn hàng bị hủy
      const cancelledOrders = await Order.countDocuments({
        ...orderFilter,
        status: "cancelled",
      });

      // Tính tỷ lệ hủy đơn (%)
      const cancellationRate =
        totalOrders > 0 ? (cancelledOrders / totalOrders) * 100 : 0;

      // Tính tỷ lệ hủy đơn của khoảng thời gian trước đó
      let previousStartDate, previousEndDate;
      if (startDate && endDate) {
        const diffMs = endDateObj - startDateObj;
        previousStartDate = new Date(startDateObj - diffMs);
        previousEndDate = new Date(startDateObj - 1);
      } else {
        switch (period) {
          case "day":
            previousStartDate = new Date(startDateObj);
            previousStartDate.setDate(startDateObj.getDate() - 1);
            previousEndDate = new Date(endDateObj);
            previousEndDate.setDate(endDateObj.getDate() - 1);
            break;
          case "month":
            previousStartDate = new Date(startDateObj);
            previousStartDate.setMonth(startDateObj.getMonth() - 1);
            previousEndDate = new Date(endDateObj);
            previousEndDate.setMonth(endDateObj.getMonth() - 1);
            break;
          case "year":
            previousStartDate = new Date(startDateObj);
            previousStartDate.setFullYear(startDateObj.getFullYear() - 1);
            previousEndDate = new Date(endDateObj);
            previousEndDate.setFullYear(endDateObj.getFullYear() - 1);
            break;
        }
      }

      const previousOrderFilter = {
        createdAt: {
          $gte: previousStartDate,
          $lte: previousEndDate,
        },
      };

      const previousTotalOrders = await Order.countDocuments(
        previousOrderFilter
      );
      const previousCancelledOrders = await Order.countDocuments({
        ...previousOrderFilter,
        status: "cancelled",
      });

      const previousCancellationRate =
        previousTotalOrders > 0
          ? (previousCancelledOrders / previousTotalOrders) * 100
          : 0;

      // Tính sự khác biệt (diff) giữa tỷ lệ hủy đơn hiện tại và trước đó
      const rateDiff = cancellationRate - previousCancellationRate;

      return {
        value: cancellationRate.toFixed(2), // Tỷ lệ hủy đơn (%)
        diff: rateDiff.toFixed(2), // Sự thay đổi so với trước đó (%)
      };
    } catch (error) {
      throw new Error("Lỗi truy vấn dữ liệu tỷ lệ hủy đơn: " + error.message);
    }
  },
  getTotalSoldProducts: async (period, startDate, endDate) => {
    try {
      let startDateObj, endDateObj;
      if (startDate && endDate) {
        startDateObj = new Date(startDate);
        endDateObj = new Date(endDate);
      } else if (period) {
        const now = new Date();
        switch (period) {
          case "day":
            startDateObj = new Date(
              now.getFullYear(),
              now.getMonth(),
              now.getDate(),
              0,
              0,
              0,
              0
            );
            endDateObj = new Date(
              now.getFullYear(),
              now.getMonth(),
              now.getDate(),
              23,
              59,
              59,
              999
            );
            break;
          case "month":
            startDateObj = new Date(now.getFullYear(), now.getMonth(), 1);
            endDateObj = new Date(
              now.getFullYear(),
              now.getMonth() + 1,
              0,
              23,
              59,
              59,
              999
            );
            break;
          case "year":
            startDateObj = new Date(now.getFullYear(), 0, 1);
            endDateObj = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
            break;
          default:
            throw new Error("Invalid period value");
        }
      } else {
        const now = new Date();
        startDateObj = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate(),
          0,
          0,
          0,
          0
        );
        endDateObj = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate(),
          23,
          59,
          59,
          999
        );
      }

      // Xác thực ngày
      if (startDateObj > endDateObj) {
        throw new Error("Ngày bắt đầu phải nhỏ hơn hoặc bằng ngày cuối cùng");
      }
      if (isNaN(startDateObj) || isNaN(endDateObj)) {
        throw new Error("Invalid date format");
      }

      // Lọc đơn hàng đã giao
      const orderFilter = {
        createdAt: {
          $gte: startDateObj,
          $lte: endDateObj,
        },
        status: "delivered",
      };

      // Tính tổng số sản phẩm đã bán
      const soldProductsAggregation = await Order.aggregate([
        { $match: orderFilter },
        { $unwind: "$products" }, // Sử dụng $unwind với trường "products"
        { $group: { _id: null, totalSold: { $sum: "$products.quantity" } } },
      ]);
      const totalSold = soldProductsAggregation[0]?.totalSold || 0;

      // Tính tổng số sản phẩm đã bán của khoảng thời gian trước đó
      let previousStartDate, previousEndDate;
      if (startDate && endDate) {
        const diffMs = endDateObj - startDateObj;
        previousStartDate = new Date(startDateObj - diffMs);
        previousEndDate = new Date(startDateObj - 1);
      } else {
        switch (period) {
          case "day":
            previousStartDate = new Date(startDateObj);
            previousStartDate.setDate(startDateObj.getDate() - 1);
            previousEndDate = new Date(endDateObj);
            previousEndDate.setDate(endDateObj.getDate() - 1);
            break;
          case "month":
            previousStartDate = new Date(startDateObj);
            previousStartDate.setMonth(startDateObj.getMonth() - 1);
            previousEndDate = new Date(endDateObj);
            previousEndDate.setMonth(endDateObj.getMonth() - 1);
            break;
          case "year":
            previousStartDate = new Date(startDateObj);
            previousStartDate.setFullYear(startDateObj.getFullYear() - 1);
            previousEndDate = new Date(endDateObj);
            previousEndDate.setFullYear(endDateObj.getFullYear() - 1);
            break;
        }
      }

      const previousOrderFilter = {
        createdAt: {
          $gte: previousStartDate,
          $lte: previousEndDate,
        },
        status: "delivered",
      };

      const previousSoldProductsAggregation = await Order.aggregate([
        { $match: previousOrderFilter },
        { $unwind: "$products" },
        { $group: { _id: null, totalSold: { $sum: "$products.quantity" } } },
      ]);
      const previousTotalSold =
        previousSoldProductsAggregation[0]?.totalSold || 0;

      // Tính sự khác biệt (diff)
      const soldDiff =
        previousTotalSold > 0
          ? ((totalSold - previousTotalSold) / previousTotalSold) * 100
          : totalSold > 0
          ? 100
          : 0;

      return {
        value: totalSold,
        diff: soldDiff.toFixed(2),
      };
    } catch (error) {
      throw new Error(
        "Lỗi truy vấn dữ liệu tổng sản phẩm đã bán: " + error.message
      );
    }
  },

  getProcessingOrders: async (period, startDate, endDate) => {
    try {
      let startDateObj, endDateObj;
      if (startDate && endDate) {
        startDateObj = new Date(startDate);
        endDateObj = new Date(endDate);
      } else if (period) {
        const now = new Date();
        switch (period) {
          case "day":
            startDateObj = new Date(
              now.getFullYear(),
              now.getMonth(),
              now.getDate(),
              0,
              0,
              0,
              0
            );
            endDateObj = new Date(
              now.getFullYear(),
              now.getMonth(),
              now.getDate(),
              23,
              59,
              59,
              999
            );
            break;
          case "month":
            startDateObj = new Date(now.getFullYear(), now.getMonth(), 1);
            endDateObj = new Date(
              now.getFullYear(),
              now.getMonth() + 1,
              0,
              23,
              59,
              59,
              999
            );
            break;
          case "year":
            startDateObj = new Date(now.getFullYear(), 0, 1);
            endDateObj = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
            break;
          default:
            throw new Error("Invalid period value");
        }
      } else {
        const now = new Date();
        startDateObj = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate(),
          0,
          0,
          0,
          0
        );
        endDateObj = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate(),
          23,
          59,
          59,
          999
        );
      }

      // Xác thực ngày
      if (startDateObj > endDateObj) {
        throw new Error("Ngày bắt đầu phải nhỏ hơn hoặc bằng ngày cuối cùng");
      }
      if (isNaN(startDateObj) || isNaN(endDateObj)) {
        throw new Error("Invalid date format");
      }

      // Lọc đơn hàng đang xử lý
      const orderFilter = {
        createdAt: {
          $gte: startDateObj,
          $lte: endDateObj,
        },
        status: { $in: ["processing", "pending"] },
      };

      const totalProcessingOrders = await Order.countDocuments(orderFilter);

      // Tính tổng đơn hàng đang xử lý của khoảng thời gian trước đó
      let previousStartDate, previousEndDate;
      if (startDate && endDate) {
        const diffMs = endDateObj - startDateObj;
        previousStartDate = new Date(startDateObj - diffMs);
        previousEndDate = new Date(startDateObj - 1);
      } else {
        switch (period) {
          case "day":
            previousStartDate = new Date(startDateObj);
            previousStartDate.setDate(startDateObj.getDate() - 1);
            previousEndDate = new Date(endDateObj);
            previousEndDate.setDate(endDateObj.getDate() - 1);
            break;
          case "month":
            previousStartDate = new Date(startDateObj);
            previousStartDate.setMonth(startDateObj.getMonth() - 1);
            previousEndDate = new Date(endDateObj);
            previousEndDate.setMonth(endDateObj.getMonth() - 1);
            break;
          case "year":
            previousStartDate = new Date(startDateObj);
            previousStartDate.setFullYear(startDateObj.getFullYear() - 1);
            previousEndDate = new Date(endDateObj);
            previousEndDate.setFullYear(endDateObj.getFullYear() - 1);
            break;
        }
      }

      const previousOrderFilter = {
        createdAt: {
          $gte: previousStartDate,
          $lte: previousEndDate,
        },
        status: { $in: ["processing", "pending"] },
      };

      const previousTotalProcessingOrders = await Order.countDocuments(
        previousOrderFilter
      );

      // Tính sự khác biệt (diff)
      const processingDiff =
        previousTotalProcessingOrders > 0
          ? ((totalProcessingOrders - previousTotalProcessingOrders) /
              previousTotalProcessingOrders) *
            100
          : totalProcessingOrders > 0
          ? 100
          : 0;

      return {
        value: totalProcessingOrders,
        diff: processingDiff.toFixed(2),
      };
    } catch (error) {
      throw new Error(
        "Lỗi truy vấn dữ liệu đơn hàng đang xử lý: " + error.message
      );
    }
  },

  getCurrentCustomers: async (period, startDate, endDate) => {
    try {
      let startDateObj, endDateObj;
      if (startDate && endDate) {
        startDateObj = new Date(startDate);
        endDateObj = new Date(endDate);
      } else if (period) {
        const now = new Date();
        switch (period) {
          case "day":
            startDateObj = new Date(
              now.getFullYear(),
              now.getMonth(),
              now.getDate(),
              0,
              0,
              0,
              0
            );
            endDateObj = new Date(
              now.getFullYear(),
              now.getMonth(),
              now.getDate(),
              23,
              59,
              59,
              999
            );
            break;
          case "month":
            startDateObj = new Date(now.getFullYear(), now.getMonth(), 1);
            endDateObj = new Date(
              now.getFullYear(),
              now.getMonth() + 1,
              0,
              23,
              59,
              59,
              999
            );
            break;
          case "year":
            startDateObj = new Date(now.getFullYear(), 0, 1);
            endDateObj = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
            break;
          default:
            throw new Error("Invalid period value");
        }
      } else {
        const now = new Date();
        startDateObj = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate(),
          0,
          0,
          0,
          0
        );
        endDateObj = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate(),
          23,
          59,
          59,
          999
        );
      }

      // Xác thực ngày
      if (startDateObj > endDateObj) {
        throw new Error("Ngày bắt đầu phải nhỏ hơn hoặc bằng ngày cuối cùng");
      }
      if (isNaN(startDateObj) || isNaN(endDateObj)) {
        throw new Error("Invalid date format");
      }

      // Lọc khách hàng dựa trên ngày tạo tài khoản
      const userFilter = {
        createdAt: {
          $gte: startDateObj,
          $lte: endDateObj,
        },
      };

      const totalCustomers = await Account.countDocuments(userFilter);

      // Tính số khách hàng của khoảng thời gian trước đó
      let previousStartDate, previousEndDate;
      if (startDate && endDate) {
        const diffMs = endDateObj - startDateObj;
        previousStartDate = new Date(startDateObj - diffMs);
        previousEndDate = new Date(startDateObj - 1);
      } else {
        switch (period) {
          case "day":
            previousStartDate = new Date(startDateObj);
            previousStartDate.setDate(startDateObj.getDate() - 1);
            previousEndDate = new Date(endDateObj);
            previousEndDate.setDate(endDateObj.getDate() - 1);
            break;
          case "month":
            previousStartDate = new Date(startDateObj);
            previousStartDate.setMonth(startDateObj.getMonth() - 1);
            previousEndDate = new Date(endDateObj);
            previousEndDate.setMonth(endDateObj.getMonth() - 1);
            break;
          case "year":
            previousStartDate = new Date(startDateObj);
            previousStartDate.setFullYear(startDateObj.getFullYear() - 1);
            previousEndDate = new Date(endDateObj);
            previousEndDate.setFullYear(endDateObj.getFullYear() - 1);
            break;
        }
      }

      const previousUserFilter = {
        createdAt: {
          $gte: previousStartDate,
          $lte: previousEndDate,
        },
      };

      const previousTotalCustomers = await Account.countDocuments(
        previousUserFilter
      );

      // Tính sự khác biệt (diff)
      const customerDiff =
        previousTotalCustomers > 0
          ? ((totalCustomers - previousTotalCustomers) /
              previousTotalCustomers) *
            100
          : totalCustomers > 0
          ? 100
          : 0;

      return {
        value: totalCustomers,
        diff: customerDiff.toFixed(2),
      };
    } catch (error) {
      throw new Error(
        "Lỗi truy vấn dữ liệu khách hàng hiện tại: " + error.message
      );
    }
  },

  getRevenueByPeriod: async (period, startDate, endDate) => {
    try {
      let startDateObj, endDateObj;
      const now = new Date();

      if (startDate && endDate) {
        startDateObj = new Date(startDate);
        endDateObj = new Date(endDate);
      } else if (period) {
        switch (period) {
          case "day":
            // Lấy thứ Hai của tuần hiện tại
            const monday = new Date(now);
            monday.setDate(now.getDate() - ((now.getDay() + 6) % 7)); // Đặt về thứ Hai
            monday.setHours(0, 0, 0, 0);
            startDateObj = monday;

            // Lấy Chủ Nhật của tuần hiện tại
            const sunday = new Date(monday);
            sunday.setDate(monday.getDate() + 6);
            sunday.setHours(23, 59, 59, 999);
            endDateObj = sunday;
            break;

          case "month":
            // Lấy 30 hoặc 31 ngày trong tháng hiện tại
            startDateObj = new Date(
              now.getFullYear(),
              now.getMonth(),
              1,
              0,
              0,
              0,
              0
            ); // Ngày 1 của tháng
            endDateObj = new Date(
              now.getFullYear(),
              now.getMonth() + 1,
              0,
              23,
              59,
              59,
              999
            ); // Ngày cuối cùng của tháng
            break;

          case "year":
            // Lấy 12 tháng trong năm hiện tại
            startDateObj = new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0); // 1/1
            endDateObj = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999); // 31/12
            break;

          default:
            throw new Error("Invalid period value");
        }
      } else {
        // Mặc định là ngày hiện tại nếu không có period hoặc range
        startDateObj = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate(),
          0,
          0,
          0,
          0
        );
        endDateObj = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate(),
          23,
          59,
          59,
          999
        );
      }

      if (startDateObj > endDateObj) {
        throw new Error("startDate must be less than or equal to endDate");
      }
      if (isNaN(startDateObj) || isNaN(endDateObj)) {
        throw new Error("Invalid date format");
      }

      const orderFilter = {
        createdAt: { $gte: startDateObj, $lte: endDateObj },
        status: { $in: ["delivered", "shipped"] }, // Chỉ tính đơn hàng đã giao hoặc đang vận chuyển
      };

      let groupBy;
      switch (period || (startDate && endDate ? "day" : "day")) {
        case "day":
          groupBy = {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          };
          break;
        case "month":
          groupBy = {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }, // Nhóm theo ngày trong tháng
          };
          break;
        case "year":
          groupBy = {
            $dateToString: { format: "%Y-%m", date: "$createdAt" }, // Nhóm theo tháng trong năm
          };
          break;
      }

      const revenueData = await Order.aggregate([
        { $match: orderFilter },
        {
          $group: {
            _id: groupBy,
            revenue: { $sum: "$totalAmount" },
          },
        },
        { $sort: { _id: 1 } },
      ]);

      // Chuyển đổi dữ liệu chỉ cho các ngày có dữ liệu
      const formattedData = revenueData.map((item) => {
        let displayDate;

        if (startDate && endDate) {
          // Hiển thị ngày (1, 2, ..., 14) cho khoảng thời gian tùy chọn
          const dateParts = item._id.split("-");
          displayDate = dateParts[2]; // Lấy ngày từ YYYY-MM-DD
        } else if (period === "day") {
          // Hiển thị thứ cho period="day" (Thứ Hai, Thứ Ba, ..., Chủ Nhật)
          const dateObj = new Date(item._id);
          const daysOfWeek = [
            "Chủ Nhật",
            "Thứ Hai",
            "Thứ Ba",
            "Thứ Tư",
            "Thứ Năm",
            "Thứ Sáu",
            "Thứ Bảy",
          ];
          displayDate = daysOfWeek[dateObj.getDay()];
        } else if (period === "month") {
          // Hiển thị ngày (1, 2, ..., 31) cho period="month"
          const dateParts = item._id.split("-");
          displayDate = dateParts[2]; // Lấy ngày từ YYYY-MM-DD
        } else if (period === "year") {
          // Hiển thị tháng (Tháng 1, Tháng 2, ..., Tháng 12) cho period="year"
          const monthParts = item._id.split("-");
          const monthIndex = parseInt(monthParts[1], 10); // Lấy tháng từ YYYY-MM
          displayDate = `Tháng ${monthIndex}`;
        } else {
          displayDate = item._id; // Mặc định nếu không có period
        }

        return {
          date: displayDate,
          value: item.revenue || 0,
          country: "Online Store",
        };
      });

      return formattedData;
    } catch (error) {
      throw new Error("Lỗi lấy dữ liệu doanh thu: " + error.message);
    }
  },
  getOrderCountByStatus: async (period, startDate, endDate) => {
    try {
      let startDateObj, endDateObj;
      const now = new Date();

      if (startDate && endDate) {
        startDateObj = new Date(startDate);
        endDateObj = new Date(endDate);
      } else if (period) {
        switch (period) {
          case "day":
            // Chỉ lấy ngày hôm nay
            startDateObj = new Date(
              now.getFullYear(),
              now.getMonth(),
              now.getDate(),
              0,
              0,
              0,
              0
            );
            endDateObj = new Date(
              now.getFullYear(),
              now.getMonth(),
              now.getDate(),
              23,
              59,
              59,
              999
            );
            break;

          case "month":
            // Lấy toàn bộ tháng hiện tại
            startDateObj = new Date(
              now.getFullYear(),
              now.getMonth(),
              1,
              0,
              0,
              0,
              0
            );
            endDateObj = new Date(
              now.getFullYear(),
              now.getMonth() + 1,
              0,
              23,
              59,
              59,
              999
            );
            break;

          case "year":
            // Lấy toàn bộ năm hiện tại
            startDateObj = new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0);
            endDateObj = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
            break;

          default:
            throw new Error("Invalid period value");
        }
      } else {
        // Mặc định lấy từ đầu tháng đến hiện tại
        startDateObj = new Date(
          now.getFullYear(),
          now.getMonth(),
          1,
          0,
          0,
          0,
          0
        );
        endDateObj = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate(),
          23,
          59,
          59,
          999
        );
      }

      if (startDateObj > endDateObj) {
        throw new Error("startDate must be less than or equal to endDate");
      }
      if (isNaN(startDateObj) || isNaN(endDateObj)) {
        throw new Error("Invalid date format");
      }

      const orderFilter = {
        createdAt: { $gte: startDateObj, $lte: endDateObj },
      };

      // Aggregate để đếm số lượng đơn hàng theo trạng thái
      const statusData = await Order.aggregate([
        { $match: orderFilter },
        {
          $group: {
            _id: "$status", // Nhóm theo trạng thái đơn hàng
            orderCount: { $sum: 1 }, // Đếm số đơn hàng
          },
        },
        { $sort: { orderCount: -1 } },
      ]);

      // Chuyển đổi trạng thái sang tiếng Việt
      const statusMap = {
        pending: "Chờ xử lý",
        processing: "Đang xử lý",
        shipped: "Đang vận chuyển",
        delivered: "Đã giao",
        cancelled: "Đã hủy",
      };

      // Định dạng dữ liệu
      const formattedData = statusData.map((item) => ({
        type: statusMap[item._id] || item._id || "Không xác định",
        value: item.orderCount || 0,
      }));

      return formattedData;
    } catch (error) {
      throw new Error("Lỗi lấy dữ liệu trạng thái đơn hàng: " + error.message);
    }
  },
};
