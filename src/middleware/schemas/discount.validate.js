const Joi = require("joi");
const validate = require("./validate");

// Schema validation cho việc tạo mới Discount
const createDiscountSchema = Joi.object({
  code: Joi.string().trim().required().messages({
    "any.required": "Mã giảm giá là bắt buộc",
    "string.empty": "Mã giảm giá không được để trống",
  }),

  type: Joi.string()
    .valid("percentage", "fixed")
    .optional()
    .default("percentage")
    .messages({
      "any.only": "Kiểu giảm giá phải là 'percentage' hoặc 'fixed'",
    }),

  value: Joi.number().required().min(0).messages({
    "any.required": "Giá trị là bắt buộc",
    "number.base": "Giá trị giảm giá phải là số",
    "number.min": "Giá trị giảm giá phải lớn hơn hoặc bằng 0",
  }),

  startDate: Joi.date().default(Date.now).messages({
    "date.base": "Ngày bắt đầu phải là định dạng ngày hợp lệ",
  }),

  endDate: Joi.date()
    .allow(null)
    .optional()
    .greater(Joi.ref("startDate"))
    .messages({
      "date.base": "Ngày kết thúc phải là định dạng ngày hợp lệ",
      "date.greater": "Ngày kết thúc phải sau ngày bắt đầu",
    }),

  maxUses: Joi.number().empty("").default(Infinity).messages({
    "number.base": "Số lần sử dụng tối đa phải là số",
    "number.min": "Số lần sử dụng tối đa phải lớn hơn hoặc bằng 1",
  }),

  minOrderValue: Joi.number().optional().min(0).default(0).messages({
    "number.base": "Giá trị đơn hàng tối thiểu phải là số",
    "number.min": "Giá trị đơn hàng tối thiểu phải lớn hơn hoặc bằng 0",
  }),

  applicableProducts: Joi.array()
    .items(Joi.string().pattern(/^[0-9a-fA-F]{24}$/)) // Kiểm tra ObjectId
    .optional()
    .messages({
      "array.base": "Danh sách sản phẩm áp dụng phải là mảng",
      "string.pattern.base": "Mỗi ID sản phẩm phải là ObjectId hợp lệ",
    }),

  status: Joi.string()
    .valid("active", "inactive", "expired")
    .optional()
    .default("active")
    .messages({
      "any.only": "Trạng thái phải là 'active', 'inactive' hoặc 'expired'",
    }),
  isApplicableToAll: Joi.boolean().default(true).optional(),
});

const updateDiscountSchema = Joi.object({
  id: Joi.string().required().messages({
    "any.required": "ID là bắt buộc",
  }),
  code: Joi.string().trim().optional().messages({
    "string.empty": "Mã giảm giá không được để trống",
  }),

  type: Joi.string()
    .valid("percentage", "fixed")
    .optional()
    .default("percentage")
    .messages({
      "any.only": "Kiểu giảm giá phải là 'percentage' hoặc 'fixed'",
    }),

  value: Joi.number().optional().min(0).messages({
    "number.base": "Giá trị giảm giá phải là số",
    "number.min": "Giá trị giảm giá phải lớn hơn hoặc bằng 0",
  }),

  startDate: Joi.date().default(Date.now).messages({
    "date.base": "Ngày bắt đầu phải là định dạng ngày hợp lệ",
  }),

  endDate: Joi.date()
    .allow(null)
    .optional()
    .greater(Joi.ref("startDate"))
    .messages({
      "date.base": "Ngày kết thúc phải là định dạng ngày hợp lệ",
      "date.greater": "Ngày kết thúc phải sau ngày bắt đầu",
    }),

  maxUses: Joi.number().empty("").default(Infinity).messages({
    "number.base": "Số lần sử dụng tối đa phải là số",
    "number.min": "Số lần sử dụng tối đa phải lớn hơn hoặc bằng 1",
  }),

  minOrderValue: Joi.number().optional().min(0).default(0).messages({
    "number.base": "Giá trị đơn hàng tối thiểu phải là số",
    "number.min": "Giá trị đơn hàng tối thiểu phải lớn hơn hoặc bằng 0",
  }),

  applicableProducts: Joi.array()
    .items(Joi.string().pattern(/^[0-9a-fA-F]{24}$/)) // Kiểm tra ObjectId
    .optional()
    .messages({
      "array.base": "Danh sách sản phẩm áp dụng phải là mảng",
      "string.pattern.base": "Mỗi ID sản phẩm phải là ObjectId hợp lệ",
    }),

  status: Joi.string()
    .valid("active", "inactive", "expired")
    .optional()
    .default("active")
    .messages({
      "any.only": "Trạng thái phải là 'active', 'inactive' hoặc 'expired'",
    }),
  isApplicableToAll: Joi.boolean().optional(),
});
module.exports = {
  validateCreateDiscount: validate(createDiscountSchema),
  validateUpdateDiscount: validate(updateDiscountSchema),
};
