const express = require("express");
const {
  getUsersAPI,
  postCreateUserAPI,
  putUpdateUserAPI,
  deleteUserAPI,
} = require("../controllers/user.controller");
const {
  validateCreateUser,
  validateUpdateUser,
} = require("../middleware/schemas/user.validate");

const routerAPI = express.Router();
routerAPI.get("/", (req, res) => {
  res.send("heelo api");
});
routerAPI.get("/user", getUsersAPI);
routerAPI.post("/user", validateCreateUser, postCreateUserAPI);
routerAPI.put("/user", validateUpdateUser, putUpdateUserAPI);
routerAPI.delete("/user", deleteUserAPI);
module.exports = routerAPI; //export default
