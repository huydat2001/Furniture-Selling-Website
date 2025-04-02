const aqp = require("api-query-params");

const getAllRecords = async (
  Model,
  page,
  limit,
  queryString,
  populateFields = []
) => {
  try {
    let result = null;
    let total = null;

    // Xử lý phân trang và lọc
    const offset = limit && page ? (page - 1) * limit : 0;
    const { filter } = aqp(queryString);
    delete filter.page;

    // Truy vấn dữ liệu
    const query = Model.find(filter);
    if (populateFields.length > 0) {
      populateFields.forEach((field) => query.populate(field));
    }

    if (limit && page) {
      query.skip(offset).limit(limit);
    }

    result = await query.exec();
    total = await Model.countDocuments(filter);

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
};

module.exports = getAllRecords;
const Discount = require("../../models/discount");
const getAllRecords = require("../../utils/queryHelper");
// cập nhật category.service.js
// module.exports = {
//   getAll: async (page, limit, queryString) => {
//     return await getAllRecords(Discount, page, limit, queryString, ["applicableProducts"]);
//   },
// };

// cập nhật user.service.js

// const Category = require("../../models/category");
// const getAllRecords = require("../../utils/queryHelper");

// module.exports = {
//   getAllCategories: async (page, limit, queryString) => {
//     return await getAllRecords(Category, page, limit, queryString, ["parent"]);
//   },
// };
