const Account = require("../../models/account");
const aqp = require("api-query-params");
const bcrypt = require("bcryptjs");

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
      const existingUser = await Account.findOneWithDeleted({
        $or: [{ email: newUser.email }, { username: newUser.username }],
      });

      const errors = [];

      if (existingUser) {
        if (existingUser.deleted) {
          // Chỉ khôi phục nếu cả email và username khớp (tùy yêu cầu)
          if (
            existingUser.email === newUser.email &&
            existingUser.username === newUser.username
          ) {
            await Account.restore({ _id: existingUser._id });
            return await Account.findById(existingUser._id).exec();
          }
        } else {
          // Thu thập lỗi nếu tài khoản tồn tại và không bị xóa mềm
          if (existingUser.email === newUser.email) {
            errors.push("Email đã tồn tại");
          }
          if (existingUser.username === newUser.username) {
            errors.push("Username đã tồn tại");
          }
        }
      }

      // Nếu có lỗi, throw tất cả lỗi cùng lúc
      if (errors.length > 0) {
        throw new Error(errors.join(", "));
      }
      const user = await Account.create(newUser);
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
      const user = await Account.findById(id);
      if (!user) {
        throw new Error("Người dùng không tồn tại");
      }
      user.fullName = newUser.fullName;
      user.role = newUser.role;
      user.phone = newUser.phone;
      user.address = {
        city: newUser.address?.[0] ?? user.address?.city,
        state: newUser.address?.[1] ?? user.address?.state,
        street: newUser.address?.[2] ?? user.address?.street,
        country: user.address?.country, // Giữ nguyên country nếu không cập nhật
      };
      // Chỉ cập nhật password nếu được cung cấp
      if (newUser.password) {
        // (Tùy chọn) Kiểm tra mật khẩu mới có khác mật khẩu cũ không
        const isSamePassword = await bcrypt.compare(
          newUser.password,
          user.password
        );
        if (isSamePassword) {
          throw new Error("Mật khẩu mới không được trùng với mật khẩu cũ");
        }
        user.password = newUser.password; // Middleware sẽ mã hóa
      }
      await user.save();
      return user;
    } catch (error) {
      throw new Error(error.message);
    }
  },
  changePassword: async (passwordData) => {
    try {
      const { id, currentPassword, newPassword } = passwordData;
      const user = await Account.findById(id);
      if (!user) {
        throw new Error("Người dùng không tồn tại");
      }

      // Kiểm tra mật khẩu hiện tại
      const isCurrentPasswordCorrect = await bcrypt.compare(
        currentPassword,
        user.password
      );
      if (!isCurrentPasswordCorrect) {
        throw new Error("Mật khẩu hiện tại không đúng");
      }

      // Kiểm tra mật khẩu mới có trùng mật khẩu cũ không
      const isSamePassword = await bcrypt.compare(newPassword, user.password);
      if (isSamePassword) {
        throw new Error("Mật khẩu mới không được trùng với mật khẩu cũ");
      }

      // Cập nhật mật khẩu mới
      user.password = newPassword; // Middleware sẽ mã hóa
      await user.save();
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
