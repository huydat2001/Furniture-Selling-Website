const aqp = require("api-query-params");
const Brand = require("../../models/brand");

//cập nhật lại tính năng xóa cứng khi tên bị trúng là bản đã bị xóa mềm
module.exports = {
  getAllBrand: async (page, limit, queryString) => {
    try {
      let result = null;
      let total = null;
      if ((limit && page) || queryString) {
        let offset = (page - 1) * limit;
        const { filter } = aqp(queryString);
        delete filter.page;
        result = await Brand.find(filter).skip(offset).limit(limit).exec();
        total = await Brand.countDocuments(filter);
      } else {
        result = await Brand.find({});
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
  createBrand: async (data) => {
    try {
      // Kiểm tra xem thương hiệu đã tồn tại hay chưa (bao gồm cả soft delete)
      const existing = await Brand.findOneWithDeleted({
        name: data.name,
      });

      if (existing) {
        if (existing.deleted) {
          // Nếu thương hiệu đã bị xóa mềm, khôi phục lại
          await Brand.restore({ _id: existing._id });
          // Cập nhật thông tin mới nếu cần
          const updatedBrand = await Brand.findByIdAndUpdate(
            existing._id,
            data,
            { new: true }
          );
          return updatedBrand;
        } else {
          // Nếu thương hiệu đã tồn tại và không bị xóa, trả về lỗi
          throw new Error("Thương hiệu đã tồn tại");
        }
      }

      // Nếu không tồn tại, tạo mới
      const result = await Brand.create(data);
      return result;
    } catch (error) {
      throw new Error(error.message);
    }
  },
  updateBrand: async (data) => {
    try {
      let checkID = await Brand.findById(data.id).exec();
      if (!checkID) {
        throw new Error("Không tồn tại ID");
      }
      let result = await Brand.updateOne({ _id: data.id }, data);
      return result;
    } catch (error) {
      throw new Error(error.message);
    }
  },
  deleteBrand: async (id) => {
    try {
      let result = await Brand.deleteById({ _id: id });
      if (!result || result.deletedCount === 0) {
        throw new Error("Nhãn hàng không tồn tại hoặc đã bị xóa trước đó");
      }
      return result;
    } catch (error) {
      throw new Error(error.message);
    }
  },
};
