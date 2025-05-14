const shortid = require("shortid");
const Order = require("../../models/order");
const Product = require("../../models/product");

const aqp = require("api-query-params");
module.exports = {
  // getOrder: async (page, limit, queryString) => {
  //   try {
  //     let result = null;
  //     let total = null;
  //     if ((limit && page) || queryString) {
  //       let offset = (page - 1) * limit;
  //       let { filter, sort } = aqp(queryString);
  //       delete filter.page;
  //       delete filter.limit;
  //       delete filter.sortBy;
  //       delete filter.order;

  //       result = await Order.find(filter)
  //         .sort(sort)
  //         .skip(offset)
  //         .limit(limit)
  //         .populate([
  //           { path: "user", select: "_id username" },
  //           { path: "products.product", select: "_id name images" },
  //         ])
  //         .exec();
  //       total = await Order.countDocuments(filter);
  //     } else {
  //       result = await Order.find(filter)
  //         .sort(sort)
  //         .populate([
  //           { path: "user", select: "_id" },
  //           { path: "products.product", select: "_id name images" },
  //         ]);
  //     }
  //     return {
  //       result,
  //       pagination: {
  //         current_page: page,
  //         limit: limit,
  //         total_pages: limit > 0 ? Math.ceil(total / limit) : 1,
  //         total: total,
  //       },
  //     };
  //   } catch (error) {
  //     throw new Error("Lỗi truy vấn dữ liệu: " + error.message);
  //   }
  // },
  getOrder: async (page, limit, queryString) => {
    try {
      let result = null;
      let total = null;

      // Ép kiểu page và limit
      const pageNum = parseInt(page, 10) || 1;
      const limitNum = parseInt(limit, 10) || 10;

      // Phân tích queryString
      let { filter } = aqp(queryString || {});
      delete filter.page;
      delete filter.limit;
      delete filter.sortBy;
      delete filter.order;
      delete filter.period;
      // Xử lý lọc theo thời gian (period)
      if (queryString.period) {
        const now = new Date();
        switch (queryString.period) {
          case "day":
            filter.createdAt = {
              $gte: new Date(now.setHours(0, 0, 0, 0)),

              $lte: new Date(now.setHours(23, 59, 59, 999)),
            };
            break;
          case "month":
            filter.createdAt = {
              $gte: new Date(now.getFullYear(), now.getMonth(), 1),

              $lte: new Date(now.getFullYear(), now.getMonth() + 1, 0),
            };
            break;
          case "year":
            filter.createdAt = {
              $gte: new Date(now.getFullYear(), 0, 1),

              $lte: new Date(now.getFullYear(), 11, 31),
            };
            break;
        }
      }
      // Tạo sort thủ công từ sortBy và order
      let sortOption = {};
      if (queryString.sortBy && queryString.order) {
        const sortOrder = queryString.order === "desc" ? -1 : 1;
        sortOption[queryString.sortBy] = sortOrder;
      } else {
        // Mặc định sắp xếp theo createdAt giảm dần
        sortOption = { createdAt: -1 };
      }
      if ((limitNum && pageNum) || queryString) {
        const offset = (pageNum - 1) * limitNum;
        result = await Order.find(filter)
          .sort(sortOption) // Sử dụng sortOption thủ công
          .skip(offset)
          .limit(limitNum)
          .populate([
            { path: "user", select: "_id username" },
            { path: "products.product", select: "_id name images" },
          ])
          .exec();
        total = await Order.countDocuments(filter);
      } else {
        result = await Order.find(filter)
          .sort(sortOption) // Sử dụng sortOption thủ công
          .populate([
            { path: "user", select: "_id" },
            { path: "products.product", select: "_id name images" },
          ])
          .exec();
        total = await Order.countDocuments(filter);
      }

      return {
        result,
        pagination: {
          current_page: pageNum,
          limit: limitNum,
          total_pages: limitNum > 0 ? Math.ceil(total / limitNum) : 1,
          total,
        },
      };
    } catch (error) {
      console.error("getOrder error:", error);
      throw new Error("Lỗi truy vấn dữ liệu: " + error.message);
    }
  },
  createOrder: async (data) => {
    try {
      const displayCode = `ORD-${shortid.generate()}`;
      const orderData = {
        ...data,
        displayCode,
      };
      const result = await Order.create(orderData);
      return result;
    } catch (error) {
      throw new Error(error.message || "Lỗi khi tạo đơn hàng.");
    }
  },

  updateOrder: async (data) => {
    try {
      const order = await Order.findById(data.id).populate("products.product");
      if (!order) {
        throw new Error("Đơn hàng không tồn tại.");
      }

      // Lưu trạng thái cũ để kiểm tra
      const oldStatus = order.status;

      // Xác định các chuyển đổi trạng thái hợp lệ
      const validTransitions = {
        pending: ["processing", "cancelled"],
        processing: ["shipped", "cancelled"],
        shipped: ["delivered"],
        delivered: [], // Không cho phép chuyển từ delivered
        cancelled: [], // Không cho phép thay đổi từ cancelled
      };

      if (!validTransitions[oldStatus].includes(data.status)) {
        throw new Error(
          `Không thể chuyển từ ${oldStatus} sang ${data.status}.`
        );
      }

      // Cập nhật trạng thái
      order.status = data.status;
      await order.save();

      // Xử lý logic khi trạng thái thay đổi
      if (data.status === "delivered" && oldStatus !== "delivered") {
        // Trừ stock và tăng sold khi giao hàng thành công
        for (const item of order.products) {
          const product = await Product.findById(item.product._id);
          if (!product) {
            throw new Error(
              `Sản phẩm với ID ${item.product._id} không tồn tại.`
            );
          }
          product.stock -= item.quantity;
          product.sold = (product.sold || 0) + item.quantity;
          await product.save();
        }
      } else if (oldStatus === "delivered" && data.status !== "delivered") {
        // Khôi phục stock và sold nếu chuyển ngược từ delivered
        for (const item of order.products) {
          const product = await Product.findById(item.product._id);
          if (!product) {
            throw new Error(
              `Sản phẩm với ID ${item.product._id} không tồn tại.`
            );
          }
          product.stock += item.quantity;
          product.sold -= item.quantity;
          await product.save();
        }
      }

      return await Order.findById(data.id)
        .populate([
          { path: "user", select: "_id username" },
          { path: "products.product", select: "_id name" },
        ])
        .exec();
    } catch (error) {
      console.error("Lỗi trong updateOrder:", error);
      throw new Error(error.message || "Lỗi khi cập nhật đơn hàng.");
    }
  },
  deleteOrder: async (id) => {
    try {
      let result = await Order.deleteOne({ _id: id });
      if (!result || result.deletedCount === 0) {
        throw new Error("Đơn hàng không tồn tại hoặc đã bị xóa trước đó");
      }
      return result;
    } catch (error) {
      throw new Error(error.message);
    }
  },
};
