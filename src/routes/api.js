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
const routerAPI = express.Router();

routerAPI.post("/auth/login", login);
routerAPI.post("/auth/refresh-token", refreshToken);
routerAPI.get("/auth/account", authenticateToken, getAccountAPI);

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
module.exports = routerAPI; //export default
