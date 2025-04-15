const aqp = require("api-query-params");
const Product = require("../../models/product");
module.exports = {
  getAllProduct: async (page, limit, queryString) => {
    try {
      let result = null;
      let total = null;
      if (limit && page) {
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
        throw new Error("Nhãn hàng không tồn tại hoặc đã bị xóa trước đó");
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
      let filter = { status: "active" };
      delete filter.page;
      if (queryString.search) {
        // const normalizedSearch = queryString.search.normalize("NFC");
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
      // Xử lý lọc theo đánh giá (cho sản phẩm gợi ý)
      if (queryString.ratings) {
        filter.ratings = Number(queryString.ratings);
      }
      if (queryString.name) {
        filter.name = queryString.name;
      }
      // Xử lý sắp xếp
      let sortOptions = {};
      if (queryString.sortBy && queryString.order) {
        sortOptions[queryString.sortBy] = queryString.order === "asc" ? 1 : -1;
      } else {
        sortOptions.createdAt = -1; // Mặc định sắp xếp theo createdAt giảm dần
      }

      // Xử lý populate
      let populateFields = [];
      if (queryString.populate) {
        populateFields = queryString.populate.split(",");
      }
      if (limit && page) {
        let offset = (page - 1) * limit;
        result = await Product.find(filter)
          .sort(sortOptions)
          .skip(offset)
          .limit(limit)
          .populate(populateFields)
          .exec();
        total = await Product.countDocuments(filter);
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
