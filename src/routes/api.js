const express = require("express");
const {
  getUsersAPI,
  postCreateUserAPI,
  putUpdateUserAPI,
  deleteUserAPI,
  putChangePasswordAPI,
} = require("../controllers/admin/user.controller");
const {
  validateCreateUser,
  validateUpdateUser,
} = require("../middleware/schemas/user.validate");

const {
  login,
  refreshToken,
  getAccountAPI,
  createAccountAPI,
  verifyEmailAPI,
  forgotPasswordAPI,
  resetPasswordAPI,
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
  getProductByQuyeryAPI,
} = require("../controllers/admin/product.controller");
const {
  uploadSingle,
  uploadMultiple,
} = require("../middleware/upload.middleware");
const {
  getCartAPI,
  addToCartAPI,
  updateCartAPI,
  removeFromCartAPI,
  removeAllCartAPI,
} = require("../controllers/user/cart.controller");
const {
  createPayment,
  VNPayReturn,
} = require("../controllers/user/vnpay.controller");
const {
  getOrderAPI,
  postCreateOrderAPI,
  putUpdateOrderAPI,
  deleteOrderAPI,
} = require("../controllers/admin/order.controller");
const {
  validateCreateOrder,
  validateUpdateOrder,
} = require("../middleware/schemas/order.validate");
const {
  getTotalMountAPI,
  getTotalOrderAPI,
  getCancellationRateAPI,
  getTotalSoldProductsAPI,
  getProcessingOrdersAPI,
  getCurrentCustomersAPI,
  getRevenueByPeriodAPI,
  getOrderCountByStatusAPI,
} = require("../controllers/admin/analytics.controller");
const {
  createCommentAPI,
  getCommentsByProductAPI,
  deleteCommentAPI,
} = require("../controllers/user/comment.controller");
const {
  validateCreateComment,
} = require("../middleware/schemas/comment.validate");
const {
  getMessages,
  sendMessage,
  unreadMessage,
  getAllMessages,
} = require("../controllers/user/socket.controller");
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
  checkRole(["admin", "staff", "customer"]),
  validateUpdateUser,
  putUpdateUserAPI
);
routerAPI.put("/user/change-password", authenticateToken, putChangePasswordAPI);
routerAPI.delete(
  "/user/:id",
  authenticateToken,
  checkRole(["admin", "staff"]),
  deleteUserAPI
);

//api category

routerAPI.get(
  "/category",
  // authenticateToken,
  // checkRole(["admin", "staff", "customer"]),
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
  // authenticateToken,
  // checkRole(["admin", "staff", "customer"]),
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

routerAPI.get(
  "/user/product",
  // authenticateToken,
  // checkRole(["admin", "staff", "customer"]),
  getProductByQuyeryAPI
);
//cart
routerAPI.get("/cart", authenticateToken, getCartAPI);
routerAPI.post("/cart/add", authenticateToken, addToCartAPI);
routerAPI.put("/cart/update", authenticateToken, updateCartAPI);
routerAPI.delete(
  "/cart/remove/:productId",
  authenticateToken,
  removeFromCartAPI
);
routerAPI.delete("/cart", authenticateToken, removeAllCartAPI);

// vnpay

routerAPI.post("/create_payment_url", createPayment);
routerAPI.get("/vnpay_return", VNPayReturn);

//order
routerAPI.get(
  "/order",
  authenticateToken,
  checkRole(["admin", "staff"]),
  getOrderAPI
);
routerAPI.post(
  "/order",
  authenticateToken,
  checkRole(["admin", "staff", "customer"]),
  validateCreateOrder,
  postCreateOrderAPI
);
routerAPI.put(
  "/order",
  authenticateToken,
  checkRole(["admin", "staff", "customer"]),
  validateUpdateOrder,
  putUpdateOrderAPI
);
routerAPI.delete(
  "/order/:id",
  authenticateToken,
  checkRole(["admin", "staff", "customer"]),
  deleteOrderAPI
);
routerAPI.post(
  "/order/cancel",
  authenticateToken,
  checkRole(["admin", "staff", "customer"]),
  deleteOrderAPI
);
routerAPI.get(
  "/analytics/total-revenue",
  authenticateToken,
  checkRole(["admin", "staff"]),
  getTotalMountAPI
);
routerAPI.get(
  "/analytics/total-order",
  authenticateToken,
  checkRole(["admin", "staff"]),
  getTotalOrderAPI
);
routerAPI.get(
  "/analytics/cancellation-rate",
  authenticateToken,
  checkRole(["admin", "staff"]),
  getCancellationRateAPI
);
routerAPI.get(
  "/analytics/total-sold-products",
  authenticateToken,
  checkRole(["admin", "staff"]),
  getTotalSoldProductsAPI
);

routerAPI.get(
  "/analytics/processing-orders",
  authenticateToken,
  checkRole(["admin", "staff"]),
  getProcessingOrdersAPI
);

routerAPI.get(
  "/analytics/current-customers",
  authenticateToken,
  checkRole(["admin", "staff"]),
  getCurrentCustomersAPI
);
routerAPI.get(
  "/analytics/revenue-by-period",
  authenticateToken,
  checkRole(["admin", "staff"]),
  getRevenueByPeriodAPI
);

routerAPI.get(
  "/analytics/order-by-status",
  authenticateToken,
  checkRole(["admin", "staff"]),
  getOrderCountByStatusAPI
);
routerAPI.post(
  "/comments",
  authenticateToken,
  checkRole(["admin", "staff, customer"]),
  validateCreateComment,
  createCommentAPI
);
routerAPI.get(
  "/comments",
  // authenticateToken,
  // checkRole(["admin", "staff, customer"]),
  getCommentsByProductAPI
);
routerAPI.delete(
  "/comments/:commentId",
  authenticateToken,
  checkRole(["admin", "staff"]),
  deleteCommentAPI
);

// chatting
routerAPI.get("/receiver/:receiver", authenticateToken, getMessages);
routerAPI.get("/unread/:receiver", authenticateToken, unreadMessage);
routerAPI.get("/allmessage", authenticateToken, getAllMessages);
routerAPI.post("/message/send/:id", authenticateToken, sendMessage);

routerAPI.post("/register", createAccountAPI);
routerAPI.post("/verify-Email", verifyEmailAPI);
routerAPI.post("/forgot-password", forgotPasswordAPI);
routerAPI.post("/reset-password", resetPasswordAPI);
module.exports = routerAPI; //export default
