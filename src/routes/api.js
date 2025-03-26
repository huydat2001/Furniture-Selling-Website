const express = require("express");
const {
  getUsersAPI,
  postCreateUserAPI,
} = require("../controllers/user.controller");
const { validateCreateUser } = require("../middleware/schemas/user.validate");

const routerAPI = express.Router();
routerAPI.get("/", (req, res) => {
  res.send("heelo api");
});
routerAPI.get("/user", getUsersAPI);
routerAPI.post("/user", validateCreateUser, postCreateUserAPI);
module.exports = routerAPI; //export default
