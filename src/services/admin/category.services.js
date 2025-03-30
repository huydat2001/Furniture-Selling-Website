const aqp = require("api-query-params");

const Category = require("../../models/Category");
module.exports = {
  getAllCategories: async (page, limit, queryString) => {
    try {
      let categories = null;
      let totalCategories = null;
      if (limit && page) {
        let offset = (page - 1) * limit;
        const { filter } = aqp(queryString);
        delete filter.page;
        categories = await Category.find(filter)
          .skip(offset)
          .limit(limit)
          .exec();
        totalCategories = await Category.countDocuments(filter);
      } else {
        categories = await Category.find({});
      }
      return {
        categories,
        pagination: {
          current_page: page,
          limit: limit,
          total_pages: limit > 0 ? Math.ceil(totalCategories / limit) : 1,
          total_categories: totalCategories,
        },
      };
    } catch (error) {
      throw new Error("Lỗi truy vấn dữ liệu: " + error.message);
    }
  },
  createCategory: async (newCategory) => {
    try {
      const existingCategory = await Category.findOne({
        name: newCategory.name,
      });

      // Thu thập tất cả lỗi trùng lặp
      const errors = [];
      if (existingCategory) {
        errors.push("Tên danh mục đã tồn tại");
      }

      // Nếu có lỗi, throw tất cả lỗi cùng lúc
      if (errors.length > 0) {
        throw new Error(errors.join(", "));
      }

      let category = await Category.create(newCategory);
      return category;
    } catch (error) {
      throw new Error(error.message);
    }
  },
  findByIDCategory: async (id) => {
    try {
      let category = await Category.findById(id).exec();
      return category;
    } catch (error) {
      console.log("error :>> ", error);
      return error;
    }
  },
  updateCategory: async (updatedCategory) => {
    try {
      const existingCategory = await Category.findOne({
        name: updatedCategory.name,
      });

      // Thu thập tất cả lỗi trùng lặp
      const errors = [];
      if (existingCategory) {
        errors.push("Tên danh mục đã tồn tại");
      }

      // Nếu có lỗi, throw tất cả lỗi cùng lúc
      if (errors.length > 0) {
        throw new Error(errors.join(", "));
      }

      let category = await Category.updateOne(
        { _id: updatedCategory.id },
        updatedCategory
      );
      return category;
    } catch (error) {
      throw new Error(error.message);
    }
  },
  deleteCategory: async (id) => {
    try {
      let category = await Category.deleteById({ _id: id });
      if (!category || category.deletedCount === 0) {
        throw new Error("Danh mục không tồn tại hoặc đã bị xóa trước đó");
      }
      return category;
    } catch (error) {
      throw new Error(error.message);
    }
  },
};
