const Joi = require("joi");
const validate = require("./validate");
const createCategorySchema = Joi.object({
  name: Joi.string().max(100).required().messages({
    "string.max": "Tên danh mục không được vượt quá 100 ký tự",
    "any.required": "Tên danh mục là bắt buộc",
  }),
  description: Joi.string().allow("").messages({
    "string.base": "Mô tả phải là chuỗi",
  }),
  parent: Joi.string().allow("").messages({
    "string.base": "Danh mục cha phải là chuỗi",
  }),
  status: Joi.string().valid("active", "inactive").default("active").messages({
    "any.only": "Trạng thái phải là active hoặc inactive",
  }),
}).unknown(true);
const updateCategorySchema = Joi.object({
  id: Joi.string().required().messages({
    "any.required": "ID danh mục là bắt buộc",
  }),
  name: Joi.string().max(100).required().messages({
    "string.max": "Tên danh mục không được vượt quá 100 ký tự",
    "any.required": "Tên danh mục là bắt buộc",
  }),
  description: Joi.string().allow("").messages({
    "string.base": "Mô tả phải là chuỗi",
  }),
  parent: Joi.string().allow("").messages({
    "string.base": "Danh mục cha phải là chuỗi",
  }),
  status: Joi.string().valid("active", "inactive").default("active").messages({
    "any.only": "Trạng thái phải là active hoặc inactive",
  }),
}).unknown(true);

module.exports = {
  validateCreateCategory: validate(createCategorySchema),
  validateUpdateCategory: validate(updateCategorySchema),
};
