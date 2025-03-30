const Account = require("../../models/account");
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
  findByIDUser: async (id) => {
    try {
      let user = await Account.findById(id).exec();
      return user;
    } catch (error) {
      console.log("error :>> ", error);
      return null;
    }
  },
  updateUser: async (newUser) => {
    try {
      const id = newUser.id;

      let user = await Account.updateOne(
        { _id: id },
        {
          password: newUser.password,
          fullName: newUser.fullName,
          role: newUser.role,
          phone: newUser.phone,
          city: newUser.address?.[0] ?? undefined,
          state: newUser.address?.[1] ?? undefined,
          street: newUser.address?.[2] ?? undefined,
          role: newUser.role,
        }
      );

      return user;
    } catch (error) {
      throw new Error(error.message);
    }
  },
  deleteUSer: async (id) => {
    try {
      let user = await Account.deleteById({ _id: id });
      if (!user || user.deletedCount === 0) {
        throw new Error("Người dùng không tồn tại hoặc đã bị xóa trước đó");
      }
      return user;
    } catch (error) {
      throw new Error(error.message);
    }
  },
  getAccount: async (id) => {
    try {
      const account = await Account.findById(id).select("-password");
      return account;
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  },
};
