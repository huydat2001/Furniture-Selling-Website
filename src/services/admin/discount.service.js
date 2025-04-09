const aqp = require("api-query-params");
const Discount = require("../../models/discount");

module.exports = {
  getAllDiscount: async (page, limit, queryString) => {
    try {
      let result = null;
      let total = null;
      if ((limit && page) || queryString) {
        let offset = (page - 1) * limit;
        let { filter } = aqp(queryString);
        delete filter.page;
        result = await Discount.find(filter)
          .skip(offset)
          .limit(limit)
          .populate("applicableProducts")
          .exec();
        total = await Discount.countDocuments(filter);
      } else {
        result = await Discount.find({}).populate("applicableProducts");
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
  createDiscount: async (data) => {
    try {
      const existing = await Discount.findOneWithDeleted({
        code: data.code,
      });

      if (existing) {
        if (existing.deleted) {
          // Xóa cứng danh mục cũ nếu đã bị xóa mềm
          await Discount.deleteOne({ _id: existing._id });
        } else {
          // Chỉ báo lỗi nếu danh mục tồn tại và không bị xóa mềm
          throw new Error("Mã giảm giá đã tồn tại");
        }
      }

      const result = await Discount.create(data);
      return result;
    } catch (error) {
      throw new Error(error.message);
    }
  },
  updateDiscount: async (data) => {
    try {
      const existing = await Discount.findOne({
        code: data.code,
      });

      // Thu thập tất cả lỗi trùng lặp
      const errors = [];
      if (existing && existing._id.toString() !== data.id) {
        errors.push("Mã Discount đã tồn tại");
      }

      // Nếu có lỗi, throw tất cả lỗi cùng lúc
      if (errors.length > 0) {
        throw new Error(errors.join(", "));
      }
      const updateData = {
        code: data.code,
        type: data.type,
        value: data.value,
        startDate: data.startDate,
        endDate: data.endDate === null ? null : data.endDate, // Đặt null nếu endDate là null
        maxUses: data.maxUses,
        minOrderValue: data.minOrderValue,
        applicableProducts: data.applicableProducts,
        status: data.status,
        isApplicableToAll: data.isApplicableToAll,
      };
      Object.keys(updateData).forEach(
        (key) => updateData[key] === undefined && delete updateData[key]
      );
      let result = await Discount.updateOne(
        { _id: data.id },
        { $set: updateData }
      );
      return result;
    } catch (error) {
      throw new Error(error.message);
    }
  },
  deleteDiscount: async (id) => {
    try {
      let result = await Discount.deleteById({ _id: id });
      if (!result || result.deletedCount === 0) {
        throw new Error("Mã Discount không tồn tại hoặc đã bị xóa trước đó");
      }
      return result;
    } catch (error) {
      throw new Error(error.message);
    }
  },
};
