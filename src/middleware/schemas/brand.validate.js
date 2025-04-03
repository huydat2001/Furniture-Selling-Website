const Joi = require("joi");
const validate = require("./validate");

const createSchema = Joi.object({
  name: Joi.string()
    .trim() // Tự động loại bỏ khoảng trắng ở đầu và cuối
    .required() // Bắt buộc
    .messages({
      "string.base": "Tên thương hiệu phải là chuỗi",
      "string.empty": "Tên thương hiệu không được để trống",
      "any.required": "Tên thương hiệu là trường bắt buộc",
    }),

  logo: Joi.string()
    .trim()
    .optional() // Không bắt buộc
    .allow("") // Cho phép chuỗi rỗng
    .messages({
      "string.base": "Logo phải là chuỗi",
    }),

  contactEmail: Joi.string()
    .trim()
    .optional()
    .allow("")
    .email({ tlds: { allow: false } }) // Kiểm tra định dạng email, không giới hạn TLD
    .messages({
      "string.base": "Email liên hệ phải là chuỗi",
      "string.email": "Email liên hệ phải có định dạng hợp lệ",
    }),

  contactPhone: Joi.string()
    .trim()
    .optional()
    .allow("")
    .pattern(/^[0-9]{10,15}$/) // Số điện thoại từ 10-15 chữ số
    .messages({
      "string.base": "Số điện thoại liên hệ phải là chuỗi",
      "string.pattern.base":
        "Số điện thoại liên hệ phải là số và có độ dài từ 10 đến 15 chữ số",
    }),

  status: Joi.string()
    .valid("active", "inactive") // Chỉ cho phép giá trị trong enum
    .default("active") // Giá trị mặc định nếu không cung cấp
    .optional()
    .messages({
      "string.base": "Trạng thái phải là chuỗi",
      "any.only": "Trạng thái phải là 'active' hoặc 'inactive'",
    }),
});
const updateSchema = Joi.object({
  id: Joi.string().required().messages({
    "any.required": "ID danh mục là bắt buộc",
  }),
  name: Joi.string()
    .trim() // Tự động loại bỏ khoảng trắng ở đầu và cuối
    .required() // Bắt buộc
    .messages({
      "string.base": "Tên thương hiệu phải là chuỗi",
      "string.empty": "Tên thương hiệu không được để trống",
      "any.required": "Tên thương hiệu là trường bắt buộc",
    }),

  logo: Joi.string()
    .trim()
    .optional() // Không bắt buộc
    .allow("") // Cho phép chuỗi rỗng
    .messages({
      "string.base": "Logo phải là chuỗi",
    }),

  contactEmail: Joi.string()
    .trim()
    .optional()
    .allow("")
    .email({ tlds: { allow: false } }) // Kiểm tra định dạng email, không giới hạn TLD
    .messages({
      "string.base": "Email liên hệ phải là chuỗi",
      "string.email": "Email liên hệ phải có định dạng hợp lệ",
    }),

  contactPhone: Joi.string()
    .trim()
    .optional()
    .allow("")
    .pattern(/^[0-9]{10,15}$/) // Số điện thoại từ 10-15 chữ số
    .messages({
      "string.base": "Số điện thoại liên hệ phải là chuỗi",
      "string.pattern.base":
        "Số điện thoại liên hệ phải là số và có độ dài từ 10 đến 15 chữ số",
    }),

  status: Joi.string()
    .valid("active", "inactive") // Chỉ cho phép giá trị trong enum
    .default("active") // Giá trị mặc định nếu không cung cấp
    .optional()
    .messages({
      "string.base": "Trạng thái phải là chuỗi",
      "any.only": "Trạng thái phải là 'active' hoặc 'inactive'",
    }),
});
module.exports = {
  validateCreateBrand: validate(createSchema),
  validateUpdateBrand: validate(updateSchema),
};
