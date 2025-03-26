const Account = require("../models/account");
const aqp = require("api-query-params");
module.exports = {
  getAllUsers: async (page, limit, queryString) => {
    try {
      let users = null;
      let totalUsers = null;
      if (limit && page) {
        let offset = (page - 1) * limit;
        const { filter } = aqp(queryString);
        delete filter.page;
        users = await Account.find(filter).skip(offset).limit(limit).exec();
        totalUsers = await Account.countDocuments(filter);
      } else {
        users = await Account.find({});
      }
      return {
        users,
        pagination: {
          current_page: page,
          limit: limit,
          total_pages: limit > 0 ? Math.ceil(totalUsers / limit) : 1,
          total_users: totalUsers,
        },
      };
    } catch (error) {
      throw new Error("Lỗi truy vấn dữ liệu: " + error.message);
    }
  },
  creatUser: async (newUser) => {
    try {
      const existingUser = await Account.findOne({
        $or: [{ email: newUser.email }, { username: newUser.username }],
      });

      // Thu thập tất cả lỗi trùng lặp
      const errors = [];
      if (existingUser) {
        if (existingUser.email === newUser.email) {
          errors.push("Email đã tồn tại");
        }
        if (existingUser.username === newUser.username) {
          errors.push("Username đã tồn tại");
        }
      }

      // Nếu có lỗi, throw tất cả lỗi cùng lúc
      if (errors.length > 0) {
        throw new Error(errors.join(", "));
      }
      let user = await Account.create(newUser);
      return user;
    } catch (error) {
      throw new Error(error.message);
    }
  },
};
