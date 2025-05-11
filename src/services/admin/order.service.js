const shortid = require("shortid");
const Order = require("../../models/order");
const Product = require("../../models/product");

const aqp = require("api-query-params");
module.exports = {
  getOrder: async (page, limit, queryString) => {
    try {
      let result = null;
      let total = null;
      if ((limit && page) || queryString) {
        let offset = (page - 1) * limit;
        let { filter } = aqp(queryString);
        delete filter.page;
        result = await Order.find(filter)
          .skip(offset)
          .limit(limit)
          .populate([
            { path: "user", select: "_id username" },
            { path: "products.product", select: "_id name images" },
          ])
          .exec();
        total = await Order.countDocuments(filter);
      } else {
        result = await Order.find({}).populate([
          { path: "user", select: "_id" },
          { path: "products.product", select: "_id name images" },
        ]);
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
  // cancelOrder: async (orderId) => {
  //   try {
  //     const order = await Order.findById(orderId).populate("products.product");
  //     if (!order) {
  //       throw new Error("Đơn hàng không tồn tại.");
  //     }
  //     if (order.status === "cancelled") {
  //       throw new Error("Đơn hàng đã bị hủy trước đó.");
  //     }
  //     if (order.status !== "pending" && order.status !== "processing") {
  //       throw new Error(
  //         "Chỉ có thể hủy đơn hàng ở trạng thái pending hoặc processing."
  //       );
  //     }

  //     // Khôi phục stock và sold
  //     for (const item of order.products) {
  //       const product = await Product.findById(item.product._id);
  //       if (!product) {
  //         throw new Error(`Sản phẩm với ID ${item.product._id} không tồn tại.`);
  //       }
  //       product.stock += item.quantity;
  //       product.sold -= item.quantity;
  //       await product.save();
  //     }

  //     // Cập nhật trạng thái đơn hàng thành cancelled
  //     order.status = "cancelled";
  //     await order.save();

  //     return await Order.findById(orderId)
  //       .populate([
  //         { path: "user", select: "_id username" },
  //         { path: "products.product", select: "_id name" },
  //       ])
  //       .exec();
  //   } catch (error) {
  //     console.error("Lỗi trong cancelOrder:", error);
  //     throw new Error(error.message || "Lỗi khi hủy đơn hàng.");
  //   }
  // },
  // updateOrder: async (data) => {
  //   try {
  //     let checkOrder = await Order.findById(data.id);
  //     if (!checkOrder) {
  //       throw new Error("Không tồn tại ID");
  //     }
  //     let result = await Order.updateOne({ _id: data.id }, data);
  //     return result;
  //   } catch (error) {
  //     throw new Error(error.message);
  //   }
  // },
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
