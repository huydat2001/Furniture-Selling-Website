const Joi = require("joi");
const validate = require("./validate");
const createSchema = Joi.object({
  name: Joi.string().trim().required().messages({
    "string.base": "Tên sản phẩm phải là chuỗi",
    "string.empty": "Tên sản phẩm không được để trống",
    "any.required": "Tên sản phẩm là trường bắt buộc",
  }),

  description: Joi.string().trim().optional().allow("").messages({
    "string.base": "Mô tả phải là chuỗi",
  }),

  price: Joi.number().required().min(0).messages({
    "number.base": "Giá phải là số",
    "number.min": "Giá phải lớn hơn hoặc bằng 0",
    "any.required": "Giá là trường bắt buộc",
  }),
  decreases: Joi.number().min(0).messages({
    "number.base": "Giảm giá phải là số",
    "number.min": "Giảm giá phải lớn hơn hoặc bằng 0",
  }),

  discounts: Joi.array()
    .items(Joi.string().trim())
    .optional()
    .default([])
    .messages({
      "array.base": "Danh sách mã giảm giá phải là mảng",
      "string.base": "Mỗi mã giảm giá phải là chuỗi",
    }),

  category: Joi.string().required().messages({
    "string.base": "Danh mục phải là chuỗi",
    "string.empty": "Danh mục không được để trống",

    "any.required": "Danh mục là trường bắt buộc",
  }),

  stock: Joi.number().required().min(0).default(0).messages({
    "number.base": "Số lượng tồn kho phải là số",
    "number.min": "Số lượng tồn kho phải lớn hơn hoặc bằng 0",
    "any.required": "Số lượng tồn kho là trường bắt buộc",
  }),

  images: Joi.array()
    .items(
      Joi.object({
        name: Joi.string().trim().required().messages({
          "string.base": "Name ảnh phải là chuỗi",
          "string.empty": "Name ảnh không được để trống",
          "any.required": "Name ảnh là bắt buộc trong mỗi ảnh",
        }),
        public_id: Joi.string().trim().required().messages({
          "string.base": "Public ID phải là chuỗi",
          "string.empty": "Public ID không được để trống",
          "any.required": "Public ID là bắt buộc trong mỗi ảnh",
        }),
      })
    )
    .optional()
    .default([])
    .messages({
      "array.base": "Danh sách ảnh phải là mảng",
    }),

  status: Joi.string()
    .valid("active", "inactive")
    .default("active")
    .optional()
    .messages({
      "string.base": "Trạng thái phải là chuỗi",
      "any.only": "Trạng thái phải là 'active' hoặc 'inactive'",
    }),

  brand: Joi.string().optional().messages({
    "string.base": "Thương hiệu phải là chuỗi",
  }),

  ratings: Joi.number().min(0).default(0).optional().messages({
    "number.base": "Điểm đánh giá phải là số",
    "number.min": "Điểm đánh giá phải lớn hơn hoặc bằng 0",
  }),

  reviews: Joi.array()
    .items(
      Joi.object({
        username: Joi.string().required().messages({
          "string.base": "Người dùng phải là chuỗi",

          "any.required": "Người dùng là bắt buộc trong mỗi đánh giá",
        }),
        rating: Joi.number().min(0).max(5).required().messages({
          "number.base": "Điểm đánh giá phải là số",
          "number.min": "Điểm đánh giá phải lớn hơn hoặc bằng 0",
          "number.max": "Điểm đánh giá phải nhỏ hơn hoặc bằng 5",
          "any.required": "Điểm đánh giá là bắt buộc trong mỗi đánh giá",
        }),
        comment: Joi.string().trim().optional().allow("").messages({
          "string.base": "Bình luận phải là chuỗi",
        }),
        createdAt: Joi.date().default(Date.now).optional().messages({
          "date.base": "Ngày tạo phải là ngày hợp lệ",
        }),
      })
    )
    .optional()
    .default([])
    .messages({
      "array.base": "Danh sách đánh giá phải là mảng",
    }),

  dimensions: Joi.object({
    length: Joi.number().min(0).optional().messages({
      "number.base": "Chiều dài phải là số",
      "number.min": "Chiều dài phải lớn hơn hoặc bằng 0",
    }),
    width: Joi.number().min(0).optional().messages({
      "number.base": "Chiều rộng phải là số",
      "number.min": "Chiều rộng phải lớn hơn hoặc bằng 0",
    }),
    height: Joi.number().min(0).optional().messages({
      "number.base": "Chiều cao phải là số",
      "number.min": "Chiều cao phải lớn hơn hoặc bằng 0",
    }),
  })
    .optional()
    .default(undefined),

  weight: Joi.number().min(0).optional().messages({
    "number.base": "Cân nặng phải là số",
    "number.min": "Cân nặng phải lớn hơn hoặc bằng 0",
  }),

  material: Joi.string().trim().optional().allow("").messages({
    "string.base": "Chất liệu phải là chuỗi",
  }),

  color: Joi.array().optional().allow("").messages({
    "string.base": "Màu sắc phải là mảng",
  }),

  isFeatured: Joi.boolean().default(false).optional().messages({
    "boolean.base": "Sản phẩm nổi bật phải là giá trị boolean",
  }),

  sold: Joi.number().min(0).default(0).optional().messages({
    "number.base": "Số lượng đã bán phải là số",
    "number.min": "Số lượng đã bán phải lớn hơn hoặc bằng 0",
  }),
});
const updateSchema = Joi.object({
  id: Joi.string().required().messages({
    "string.base": "ID phải là chuỗi",
    "string.empty": "ID không được để trống",
    "any.required": "ID là trường bắt buộc",
  }),

  name: Joi.string().trim().required().messages({
    "string.base": "Tên sản phẩm phải là chuỗi",
    "string.empty": "Tên sản phẩm không được để trống",
    "any.required": "Tên sản phẩm là trường bắt buộc",
  }),

  description: Joi.string().trim().optional().allow("").messages({
    "string.base": "Mô tả phải là chuỗi",
  }),

  price: Joi.number().required().min(0).messages({
    "number.base": "Giá phải là số",
    "number.min": "Giá phải lớn hơn hoặc bằng 0",
  }),
  decreases: Joi.number().min(0).messages({
    "number.base": "Giảm giá phải là số",
    "number.min": "Giảm giá lớn hơn hoặc bằng 0",
  }),

  discounts: Joi.array()
    .items(Joi.string().trim())
    .optional()
    .default([])
    .messages({
      "array.base": "Danh sách mã giảm giá phải là mảng",
    }),

  category: Joi.string()
    .required()

    .messages({
      "string.base": "Danh mục phải là chuỗi",
      "string.empty": "Danh mục không được để trống",

      "any.required": "Danh mục là trường bắt buộc",
    }),

  stock: Joi.number().required().min(0).default(0).messages({
    "number.base": "Số lượng tồn kho phải là số",
    "number.min": "Số lượng tồn kho phải lớn hơn hoặc bằng 0",
    "any.required": "Số lượng tồn kho là trường bắt buộc",
  }),

  images: Joi.array()
    .items(
      Joi.object({
        name: Joi.string().trim().required().messages({
          "string.base": "Name ảnh phải là chuỗi",
          "string.empty": "Name ảnh không được để trống",
          "any.required": "Name ảnh là bắt buộc trong mỗi ảnh",
        }),
        public_id: Joi.string().trim().required().messages({
          "string.base": "Public ID phải là chuỗi",
          "string.empty": "Public ID không được để trống",
          "any.required": "Public ID là bắt buộc trong mỗi ảnh",
        }),
      })
    )
    .optional()
    .default([])
    .messages({
      "array.base": "Danh sách ảnh phải là mảng",
    }),

  status: Joi.string()
    .valid("active", "inactive")
    .default("active")
    .optional()
    .messages({
      "string.base": "Trạng thái phải là chuỗi",
      "any.only": "Trạng thái phải là 'active' hoặc 'inactive'",
    }),

  brand: Joi.string().optional().messages({
    "string.base": "Thương hiệu phải là chuỗi",
  }),

  ratings: Joi.number().min(0).default(0).optional().messages({
    "number.base": "Điểm đánh giá phải là số",
    "number.min": "Điểm đánh giá phải lớn hơn hoặc bằng 0",
  }),

  reviews: Joi.array()
    .items(
      Joi.object({
        username: Joi.string().required().messages({
          "string.base": "Người dùng phải là chuỗi",
          "any.required": "Người dùng là bắt buộc trong mỗi đánh giá",
        }),
        rating: Joi.number().min(0).max(5).required().messages({
          "number.base": "Điểm đánh giá phải là số",
          "number.min": "Điểm đánh giá phải lớn hơn hoặc bằng 0",
          "number.max": "Điểm đánh giá phải nhỏ hơn hoặc bằng 5",
          "any.required": "Điểm đánh giá là bắt buộc trong mỗi đánh giá",
        }),
        comment: Joi.string().trim().optional().allow("").messages({
          "string.base": "Bình luận phải là chuỗi",
        }),
        createdAt: Joi.date().default(Date.now).optional().messages({
          "date.base": "Ngày tạo phải là ngày hợp lệ",
        }),
      })
    )
    .optional()
    .default([])
    .messages({
      "array.base": "Danh sách đánh giá phải là mảng",
    }),

  dimensions: Joi.object({
    length: Joi.number().min(0).optional().messages({
      "number.base": "Chiều dài phải là số",
      "number.min": "Chiều dài phải lớn hơn hoặc bằng 0",
    }),
    width: Joi.number().min(0).optional().messages({
      "number.base": "Chiều rộng phải là số",
      "number.min": "Chiều rộng phải lớn hơn hoặc bằng 0",
    }),
    height: Joi.number().min(0).optional().messages({
      "number.base": "Chiều cao phải là số",
      "number.min": "Chiều cao phải lớn hơn hoặc bằng 0",
    }),
  })
    .optional()
    .default(undefined),

  weight: Joi.number().min(0).optional().messages({
    "number.base": "Cân nặng phải là số",
    "number.min": "Cân nặng phải lớn hơn hoặc bằng 0",
  }),

  material: Joi.string().trim().optional().allow("").messages({
    "string.base": "Chất liệu phải là chuỗi",
  }),

  color: Joi.array().optional().allow("").messages({
    "string.base": "Màu sắc phải là chuỗi",
  }),

  isFeatured: Joi.boolean().default(false).optional().messages({
    "boolean.base": "Sản phẩm nổi bật phải là giá trị boolean",
  }),

  sold: Joi.number().min(0).default(0).optional().messages({
    "number.base": "Số lượng đã bán phải là số",
    "number.min": "Số lượng đã bán phải lớn hơn hoặc bằng 0",
  }),
});

module.exports = {
  validateCreateProduct: validate(createSchema),
  validateUpdateProduct: validate(updateSchema),
};
