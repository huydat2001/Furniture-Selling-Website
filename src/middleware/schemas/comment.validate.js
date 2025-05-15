const Joi = require("joi");
const validate = require("./validate");

const createSchema = Joi.object({
  productId: Joi.string()
    .required()
    .pattern(/^[0-9a-fA-F]{24}$/) // Kiểm tra định dạng ObjectId
    .messages({
      "string.base": "ID sản phẩm phải là chuỗi",
      "string.empty": "ID sản phẩm không được để trống",
      "any.required": "ID sản phẩm là trường bắt buộc",
      "string.pattern.base": "ID sản phẩm không đúng định dạng ObjectId",
    }),
  content: Joi.string().required().min(1).max(500).trim().messages({
    "string.base": "Nội dung phải là chuỗi",
    "string.empty": "Nội dung không được để trống",
    "any.required": "Nội dung là trường bắt buộc",
    "string.min": "Nội dung phải có ít nhất 1 ký tự",
    "string.max": "Nội dung không được vượt quá 500 ký tự",
  }),
  rating: Joi.number().required().min(1).max(5).messages({
    "number.base": "Đánh giá phải là số",
    "number.min": "Đánh giá phải lớn hơn hoặc bằng 1",
    "number.max": "Đánh giá phải nhỏ hơn hoặc bằng 5",
    "any.required": "Đánh giá là trường bắt buộc",
  }),
});

module.exports = {
  validateCreateComment: validate(createSchema),
};
