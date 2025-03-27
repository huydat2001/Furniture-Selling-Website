const Account = require("../models/account");
const {
  getAllUsers,
  creatUser,
  updateUser,
} = require("../services/user.services");
const Joi = require("joi");

module.exports = {
  getUsersAPI: async (req, res) => {
    try {
      let { page, limit } = req.query;
      const result = await getAllUsers(page, limit, req.query);
      return res.status(200).json({
        data: {
          statusCode: true,
          pagination: result.pagination,
          result: result.users,
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

  postCreateUserAPI: async (req, res) => {
    try {
      const {
        username,
        email,
        password,
        fullName,
        address,
        phone,
        street,
        city,
        state,
        country,
      } = req.body;
      const finalAddress = address || {
        street: "",
        city: "",
        state: "",
        country: "",
      };
      if (street || city || state || country) {
        finalAddress.street = street;
        finalAddress.city = city;
        finalAddress.state = state;
        finalAddress.country = country;
      }
      const newUser = {
        username,
        email,
        password,
        fullName,
        address: finalAddress,
        phone,
      };
      let result = await creatUser(newUser);
      if (!result) {
        throw new Error("Không thể tạo người dùng");
      }
      return res.status(201).json({
        statusCode: true,
        data: result,
      });
    } catch (error) {
      if (error.message.includes("đã tồn tại")) {
        const errorMessages = error.message.split(", ");
        return res.status(400).json({
          success: false,
          error: {
            code: 400,
            messages: errorMessages, // Trả về mảng
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
  putUpdateUserAPI: async (req, res) => {
    try {
      const {
        id,
        password,
        fullName,
        address,
        phone,
        street,
        city,
        state,
        country,
      } = req.body;
      const finalAddress = address || {
        street: "",
        city: "",
        state: "",
        country: "",
      };
      if (street || city || state || country) {
        finalAddress.street = street;
        finalAddress.city = city;
        finalAddress.state = state;
        finalAddress.country = country;
      }
      const newUser = {
        id,
        password,
        fullName,
        address: finalAddress,
        phone,
      };
      let result = await updateUser(newUser);
      if (!result) {
        throw new Error("Không thể cập nhật người dùng");
      }
      return res.status(200).json({
        statusCode: true,
        data: result,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: {
          code: 400,
          message: error.message,
        },
      });
    }
  },
  deleteUserAPI: async (req, res) => {
    try {
      let id = req.body.id;
      let result = await deleteUSer(id);

      return res.status(200).json({
        statusCode: true,
        data: result,
      });
    } catch (error) {}
  },
};
