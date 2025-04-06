const express = require("express");
const {
  getUsersAPI,
  postCreateUserAPI,
  putUpdateUserAPI,
  deleteUserAPI,
} = require("../controllers/admin/user.controller");
const {
  validateCreateUser,
  validateUpdateUser,
} = require("../middleware/schemas/user.validate");

const {
  login,
  refreshToken,
  getAccountAPI,
} = require("../controllers/auth.controller");
const {
  authenticateToken,
  checkRole,
} = require("../middleware/auth.middleware");
const {
  getAllCategoriesAPI,
  postCreateCategoryAPI,
  putUpdateCategoryAPI,
  deleteCategoryAPI,
} = require("../controllers/admin/category.controller");
const {
  validateCreateCategory,
  validateUpdateCategory,
} = require("../middleware/schemas/category.validate");
const {
  getAllDiscountAPI,
  postCreateDiscountAPI,
  putUpdateDiscountAPI,
  deleteDiscountAPI,
} = require("../controllers/admin/discount.controller");
const {
  validateCreateDiscount,
  validateUpdateDiscount,
} = require("../middleware/schemas/discount.validate");
const {
  getAllBrandAPI,
  postCreateBrandAPI,
  putUpdateBrandAPI,
  deleteBrandAPI,
} = require("../controllers/admin/brand.controller");
const {
  validateCreateBrand,
  validateUpdateBrand,
} = require("../middleware/schemas/brand.validate");
const {
  postUploadSingleFileAPI,
  postUploadMultipleFilesAPI,
} = require("../controllers/upload.controller");
const {
  validateCreateProduct,
  validateUpdateProduct,
} = require("../middleware/schemas/product.validate");
const {
  getAllProductAPI,
  postCreateProductAPI,
  putUpdateProductAPI,
  deleteProductAPI,
} = require("../controllers/admin/product.controller");
const {
  uploadSingle,
  uploadMultiple,
} = require("../middleware/upload.middleware");
const routerAPI = express.Router();

routerAPI.post("/upload", uploadSingle, postUploadSingleFileAPI);
routerAPI.post("/uploadmultiple", uploadMultiple, postUploadMultipleFilesAPI);
//api login
routerAPI.post("/auth/login", login);
routerAPI.post("/auth/refresh-token", refreshToken);
routerAPI.get("/auth/account", authenticateToken, getAccountAPI);

//api user
routerAPI.get(
  "/user",
  authenticateToken,
  checkRole(["admin", "staff"]),
  getUsersAPI
);
routerAPI.post(
  "/user",
  authenticateToken,
  checkRole(["admin", "staff"]),
  validateCreateUser,
  postCreateUserAPI
);
routerAPI.put(
  "/user",
  authenticateToken,
  checkRole(["admin", "staff"]),
  validateUpdateUser,
  putUpdateUserAPI
);
routerAPI.delete(
  "/user/:id",
  authenticateToken,
  checkRole(["admin", "staff"]),
  deleteUserAPI
);

//api category

routerAPI.get(
  "/category",
  authenticateToken,
  checkRole(["admin", "staff"]),
  getAllCategoriesAPI
);
routerAPI.post(
  "/category",
  authenticateToken,
  checkRole(["admin", "staff"]),
  validateCreateCategory,
  postCreateCategoryAPI
);
routerAPI.put(
  "/category",
  authenticateToken,
  checkRole(["admin", "staff"]),
  validateUpdateCategory,
  putUpdateCategoryAPI
);
routerAPI.delete(
  "/category/:id",
  authenticateToken,
  checkRole(["admin", "staff"]),
  deleteCategoryAPI
);

//api discount

routerAPI.get(
  "/discount",
  authenticateToken,
  checkRole(["admin", "staff"]),
  getAllDiscountAPI
);
routerAPI.post(
  "/discount",
  authenticateToken,
  checkRole(["admin", "staff"]),
  validateCreateDiscount,
  postCreateDiscountAPI
);
routerAPI.put(
  "/discount",
  authenticateToken,
  checkRole(["admin", "staff"]),
  validateUpdateDiscount,
  putUpdateDiscountAPI
);
routerAPI.delete(
  "/discount/:id",
  authenticateToken,
  checkRole(["admin", "staff"]),
  deleteDiscountAPI
);

//api brand

routerAPI.get(
  "/brand",
  authenticateToken,
  checkRole(["admin", "staff"]),
  getAllBrandAPI
);
routerAPI.post(
  "/brand",
  authenticateToken,
  checkRole(["admin", "staff"]),
  validateCreateBrand,
  postCreateBrandAPI
);
routerAPI.put(
  "/brand",
  authenticateToken,
  checkRole(["admin", "staff"]),
  validateUpdateBrand,
  putUpdateBrandAPI
);
routerAPI.delete(
  "/brand/:id",
  authenticateToken,
  checkRole(["admin", "staff"]),
  deleteBrandAPI
);

//api product

routerAPI.get(
  "/product",
  authenticateToken,
  checkRole(["admin", "staff"]),
  getAllProductAPI
);
routerAPI.post(
  "/product",
  authenticateToken,
  checkRole(["admin", "staff"]),
  validateCreateProduct,
  postCreateProductAPI
);
routerAPI.put(
  "/product",
  authenticateToken,
  checkRole(["admin", "staff"]),
  validateUpdateProduct,
  putUpdateProductAPI
);
routerAPI.delete(
  "/product/:id",
  authenticateToken,
  checkRole(["admin", "staff"]),
  deleteProductAPI
);
module.exports = routerAPI; //export default
