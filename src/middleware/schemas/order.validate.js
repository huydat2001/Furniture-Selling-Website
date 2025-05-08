const Joi = require("joi");
const validate = require("./validate");

const createSchema = Joi.object({
  user: Joi.string().required().messages({
    "string.base": "ID người dùng phải là chuỗi",
    "string.empty": "ID người dùng không được để trống",
    "any.required": "ID người dùng là trường bắt buộc",
  }),
  displayCode: Joi.string().optional().messages({
    "string.base": "Mã hiển thị phải là chuỗi",
    "string.empty": "Mã hiển thị không được để trống",
    "any.required": "Mã hiển thị là trường bắt buộc",
  }),
  products: Joi.array()
    .items(
      Joi.object({
        product: Joi.string().required().messages({
          "string.base": "ID sản phẩm phải là chuỗi",
          "string.empty": "ID sản phẩm không được để trống",
          "any.required": "ID sản phẩm là bắt buộc trong mỗi sản phẩm",
        }),
        quantity: Joi.number().required().min(1).messages({
          "number.base": "Số lượng phải là số",
          "number.min": "Số lượng phải lớn hơn hoặc bằng 1",
          "any.required": "Số lượng là trường bắt buộc trong mỗi sản phẩm",
        }),
        price: Joi.number().required().min(0).messages({
          "number.base": "Giá phải là số",
          "number.min": "Giá phải lớn hơn hoặc bằng 0",
          "any.required": "Giá là trường bắt buộc trong mỗi sản phẩm",
        }),
      })
    )
    .required()
    .min(1)
    .messages({
      "array.base": "Danh sách sản phẩm phải là mảng",
      "array.min": "Danh sách sản phẩm phải có ít nhất 1 sản phẩm",
      "any.required": "Danh sách sản phẩm là trường bắt buộc",
    }),

  totalAmount: Joi.number().required().min(0).messages({
    "number.base": "Tổng số tiền phải là số",
    "number.min": "Tổng số tiền phải lớn hơn hoặc bằng 0",
    "any.required": "Tổng số tiền là trường bắt buộc",
  }),

  shippingAddress: Joi.object({
    fullName: Joi.string().trim().optional().allow("").messages({
      "string.base": "Tên người nhận phải là chuỗi",
    }),
    phone: Joi.string().trim().optional().allow("").messages({
      "string.base": "Số điện thoại phải là chuỗi",
    }),
    street: Joi.string().trim().optional().allow("").messages({
      "string.base": "Địa chỉ cụ thể phải là chuỗi",
    }),
    city: Joi.string().trim().optional().allow("").messages({
      "string.base": "Tỉnh/thành phải là chuỗi",
    }),
    state: Joi.string().trim().optional().allow("").messages({
      "string.base": "Quận/huyện phải là chuỗi",
    }),
  })
    .optional()
    .default(undefined),

  paymentMethod: Joi.string()
    .valid("cod", "vnpay", "bank_account")
    .default("cod")
    .optional()
    .messages({
      "string.base": "Phương thức thanh toán phải là chuỗi",
      "any.only":
        "Phương thức thanh toán phải là 'cod', 'vnpay' hoặc 'bank_account'",
    }),

  status: Joi.string()
    .valid("pending", "processing", "shipped", "delivered", "cancelled")
    .default("pending")
    .optional()
    .messages({
      "string.base": "Trạng thái phải là chuỗi",
      "any.only":
        "Trạng thái phải là 'pending', 'processing', 'shipped', 'delivered' hoặc 'cancelled'",
    }),
});

const updateSchema = Joi.object({
  id: Joi.string().required().messages({
    "string.base": "ID phải là chuỗi",
    "string.empty": "ID không được để trống",
    "any.required": "ID là trường bắt buộc",
  }),
  displayCode: Joi.string().optional().messages({
    "string.base": "Mã hiển thị phải là chuỗi",
  }),
  shippingAddress: Joi.object({
    fullName: Joi.string().trim().optional().allow("").messages({
      "string.base": "Tên người nhận phải là chuỗi",
    }),
    phone: Joi.string().trim().optional().allow("").messages({
      "string.base": "Số điện thoại phải là chuỗi",
    }),
    street: Joi.string().trim().optional().allow("").messages({
      "string.base": "Địa chỉ cụ thể phải là chuỗi",
    }),
    city: Joi.string().trim().optional().allow("").messages({
      "string.base": "Tỉnh/thành phải là chuỗi",
    }),
    state: Joi.string().trim().optional().allow("").messages({
      "string.base": "Quận/huyện phải là chuỗi",
    }),
  })
    .optional()
    .default(undefined),

  paymentMethod: Joi.string()
    .valid("cod", "vnpay", "bank_account")
    .optional()
    .messages({
      "string.base": "Phương thức thanh toán phải là chuỗi",
      "any.only":
        "Phương thức thanh toán phải là 'cod', 'vnpay' hoặc 'bank_account'",
    }),

  status: Joi.string()
    .valid("pending", "processing", "shipped", "delivered", "cancelled")
    .optional()
    .messages({
      "string.base": "Trạng thái phải là chuỗi",
      "any.only":
        "Trạng thái phải là 'pending', 'processing', 'shipped', 'delivered' hoặc 'cancelled'",
    }),
});

module.exports = {
  validateCreateOrder: validate(createSchema),
  validateUpdateOrder: validate(updateSchema),
};
