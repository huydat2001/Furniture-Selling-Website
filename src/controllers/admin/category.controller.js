const {
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} = require("../../services/admin/category.services");

module.exports = {
  getAllCategoriesAPI: async (req, res) => {
    try {
      let { page, limit } = req.query;
      const result = await getAllCategories(page, limit, req.query);
      return res.status(200).json({
        data: {
          statusCode: true,
          pagination: result.pagination,
          result: result.categories,
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
  postCreateCategoryAPI: async (req, res) => {
    try {
      const { name, description, parent, status } = req.body;
      const newCategory = {
        name,
        description,
        parent,
        status,
      };
      const result = await createCategory(newCategory);
      if (!result) {
        throw new Error("Không thể tạo danh mục");
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
  putUpdateCategoryAPI: async (req, res) => {
    try {
      const { id, name, description, parent, status } = req.body;
      const updatedCategory = {
        id,
        name,
        description,
        parent,
        status,
      };
      const category = await updateCategory(updatedCategory);
      return res.status(200).json({
        data: {
          statusCode: true,
          result: category,
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
  deleteCategoryAPI: async (req, res) => {
    try {
      const { id } = req.params;
      const category = await deleteCategory(id);

      return res.status(200).json({
        data: {
          statusCode: true,
          result: category,
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
