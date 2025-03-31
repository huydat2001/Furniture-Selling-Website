const Joi = require("joi");
const validate = require("./validate");

// Schema cho tạo user (các field bắt buộc)
const createUserSchema = Joi.object({
  username: Joi.string().min(3).max(25).required().messages({
    "string.min": "Username phải có ít nhất 6 ký tự",
    "string.max": "Username không được vượt quá 25 ký tự",
  }),
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .required()
    .messages({
      "string.email": "Email không đúng định dạng",
      "any.required": "Email là bắt buộc",
    }),
  password: Joi.string().min(6).required().messages({
    "string.min": "Mật khẩu phải dài ít nhất 6 ký tự",
    "any.required": "Mật khẩu là bắt buộc",
  }),
  fullName: Joi.string().allow("").messages({
    "string.base": "Tên đầy đủ phải là chuỗi",
  }),
  address: Joi.object({
    street: Joi.string().allow(""),
    city: Joi.string().allow(""),
    state: Joi.string().allow(""),
    country: Joi.string().allow(""),
  })
    .optional()
    .default({ street: "", city: "", state: "", country: "" }),
  phone: Joi.string().allow("").pattern(new RegExp("^[0-9]{10,11}$")).messages({
    "string.pattern.base": "Số điện thoại phải có 10 hoặc 11 chữ số",
  }),
  role: Joi.string()
    .valid("customer", "admin", "staff")
    .default("customer")
    .messages({
      "any.only": "Vai trò phải là customer, admin hoặc staff",
    }),
  status: Joi.string().valid("active", "banned").default("active").messages({
    "any.only": "Trạng thái phải là active hoặc banned",
  }),
}).unknown(true);

// Schema cho cập nhật user (các field không bắt buộc)
const updateUserSchema = Joi.object({
  password: Joi.string().min(6).optional().messages({
    "string.min": "Mật khẩu phải dài ít nhất 6 ký tự",
  }),
  fullName: Joi.string().allow("").optional().messages({
    "string.base": "Tên đầy đủ phải là chuỗi",
  }),
  address: Joi.object({
    street: Joi.string().allow(""),
    city: Joi.string().allow(""),
    state: Joi.string().allow(""),
    country: Joi.string().allow(""),
  })
    .optional()
    .default({ street: "", city: "", state: "", country: "" }),
  phone: Joi.string().allow("").pattern(new RegExp("^[0-9]{10,11}$")).messages({
    "string.pattern.base": "Số điện thoại phải có 10 hoặc 11 chữ số",
  }),
  role: Joi.string().valid("customer", "admin", "staff").optional().messages({
    "any.only": "Vai trò phải là customer, admin hoặc staff",
  }),
}).unknown(true);

// Middleware validate

module.exports = {
  validateCreateUser: validate(createUserSchema),
  validateUpdateUser: validate(updateUserSchema),
};
