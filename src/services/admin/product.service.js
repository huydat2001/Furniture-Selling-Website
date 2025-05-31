const aqp = require("api-query-params");
const Product = require("../../models/product");
const Order = require("../../models/order");
module.exports = {
  getAllProduct: async (page, limit, queryString) => {
    try {
      let result = null;
      let total = null;
      if ((limit && page) || queryString) {
        let offset = (page - 1) * limit;
        const { filter } = aqp(queryString);
        delete filter.page;
        result = await Product.find(filter)
          .skip(offset)
          .limit(limit)
          .populate("discounts category brand")
          .exec();
        total = await Product.countDocuments(filter);
      } else {
        result = await Product.find({}).populate("discounts category brand");
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
  createProduct: async (data) => {
    try {
      const existing = await Product.findOneWithDeleted({
        name: data.name,
      });

      if (existing) {
        if (existing.deleted) {
          await Product.restore({ _id: existing._id });
          const updatedBrand = await Product.findByIdAndUpdate(
            existing._id,
            data,
            { new: true }
          );
          return updatedBrand;
        } else {
          throw new Error("Sản phẩm đã tồn tại");
        }
      }

      // Nếu không tồn tại, tạo mới
      const result = await Product.create(data);
      return result;
    } catch (error) {
      throw new Error(error.message);
    }
  },
  updateProduct: async (data) => {
    try {
      let checkID = await Product.findById(data.id).exec();
      if (!checkID) {
        throw new Error("Không tồn tại ID");
      }
      let result = await Product.updateOne({ _id: data.id }, data);
      return result;
    } catch (error) {
      throw new Error(error.message);
    }
  },
  deleteProduct: async (id) => {
    try {
      let result = await Product.deleteById({ _id: id });
      if (!result || result.deletedCount === 0) {
        throw new Error("Sản phẩm không tồn tại hoặc đã bị xóa trước đó");
      }
      return result;
    } catch (error) {
      throw new Error(error.message);
    }
  },
  getProductByQuyery: async (page, limit, queryString) => {
    try {
      let result = null;
      let total = null;

      // Lọc cơ bản
      let filter = { status: "active" };

      // Xử lý tìm kiếm
      if (queryString.search) {
        filter.$or = [
          { name: { $regex: queryString.search, $options: "i" } },
          { description: { $regex: queryString.search, $options: "i" } },
        ];
      }

      // Xử lý lọc theo khoảng giá
      if (queryString.minPrice || queryString.maxPrice) {
        filter.price = {};
        if (queryString.minPrice) {
          filter.price.$gte = Number(queryString.minPrice);
        }
        if (queryString.maxPrice) {
          filter.price.$lte = Number(queryString.maxPrice);
        }
      }
      console.log("queryString :>> ", queryString);
      // Xử lý lọc theo đánh giá
      if (queryString.rating) {
        // Sửa ratings thành rating
        const ratingValue = Number(queryString.rating);
        filter.ratings = {
          // Vẫn sử dụng ratings vì đó là tên trường trong schema
          $gte: ratingValue - 0.5,
          $lte: ratingValue + 0.5,
        };
        console.log("Rating Filter Applied:", filter.ratings); // Debug
      }
      if (queryString.category) {
        filter.category = queryString.category; // Lọc theo category
      }
      if (queryString.name) {
        filter.name = queryString.name;
      }
      // Thêm điều kiện lọc isFeatured
      if (queryString.isFeatured !== undefined) {
        filter.isFeatured =
          queryString.isFeatured === "true" || queryString.isFeatured === true;
      }
      // Tính toán sold dựa trên đơn hàng trong period
      let productSoldMap = {};
      if (queryString.period) {
        const now = new Date();
        let orderFilter = { status: "delivered" }; // Chỉ lấy đơn hàng đã giao
        let startDate, endDate;

        switch (queryString.period) {
          case "day":
            startDate = new Date(
              now.getFullYear(),
              now.getMonth(),
              now.getDate(),
              0,
              0,
              0,
              0
            );
            endDate = new Date(
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
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
            endDate = new Date(
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
            startDate = new Date(now.getFullYear(), 0, 1);
            endDate = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
            break;
          default:
            startDate = new Date(0); // Từ thời điểm 0
            endDate = new Date(); // Đến hiện tại
        }

        orderFilter.createdAt = {
          $gte: startDate,
          $lte: endDate,
        };

        // Log khoảng thời gian để kiểm tra

        // Lấy danh sách đơn hàng trong khoảng thời gian và tính sold
        const orders = await Order.find(orderFilter).populate(
          "products.product"
        );

        orders.forEach((order) => {
          order.products.forEach((item) => {
            const productId = item.product?._id?.toString();
            if (productId) {
              productSoldMap[productId] =
                (productSoldMap[productId] || 0) + item.quantity;
            }
          });
        });

        // Lọc các sản phẩm có trong danh sách sold
        if (Object.keys(productSoldMap).length > 0) {
          filter._id = { $in: Object.keys(productSoldMap) };
        } else {
          // Nếu không có đơn hàng nào, trả về danh sách rỗng
          return {
            result: [],
            pagination: {
              current_page: page,
              limit: limit,
              total_pages: 0,
              total: 0,
            },
          };
        }
      }

      // Xử lý sắp xếp
      let sortOptions = {};
      if (queryString.sortBy && queryString.order) {
        if (queryString.sortBy === "sold" && queryString.period) {
          sortOptions = null; // Sắp xếp thủ công
        } else {
          sortOptions[queryString.sortBy] =
            queryString.order === "asc" ? 1 : -1;
        }
      } else {
        sortOptions.createdAt = -1;
      }

      // Xử lý populate
      let populateFields = [];
      if (queryString.populate) {
        populateFields = queryString.populate.split(",");
      }

      if (limit && page) {
        let offset = (page - 1) * limit;
        // Lấy tất cả sản phẩm khớp filter trước
        let products = await Product.find(filter)
          .populate(populateFields)
          .exec();
        total = products.length;

        // Nếu sắp xếp theo sold và có period, sắp xếp thủ công
        if (queryString.sortBy === "sold" && queryString.period) {
          result = products
            .map((product) => ({
              ...product.toObject(),
              soldInPeriod: productSoldMap[product._id.toString()] || 0,
            }))
            .sort((a, b) => {
              return queryString.order === "asc"
                ? a.soldInPeriod - b.soldInPeriod
                : b.soldInPeriod - a.soldInPeriod; // Sửa lỗi sắp xếp
            });

          // Áp dụng phân trang
          result = result.slice(offset, offset + parseInt(limit));
        } else {
          result = await Product.find(filter)
            .sort(sortOptions)
            .skip(offset)
            .limit(limit)
            .populate(populateFields)
            .exec();
        }
      } else {
        result = await Product.find(filter)
          .sort(sortOptions)
          .populate(populateFields)
          .exec();
        total = await Product.countDocuments(filter);
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
};
