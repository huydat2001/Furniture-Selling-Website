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
const routerAPI = express.Router();

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

//api product

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
module.exports = routerAPI; //export default
