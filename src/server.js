require("dotenv").config();
const express = require("express");
const configViewEngine = require("./config/viewEngine");

const apiRoutes = require("./routes/api");

const connection = require("./config/database");

const { initializeDefaultAccounts } = require("./utils/add.account");
const app = express();
const port = process.env.PORT || 8888; //port => hardcode . uat .prod
const hostname = process.env.HOST_NAME;

app.use(express.json()); // for json
app.use(express.urlencoded({ extended: true })); // for form data
configViewEngine(app);

app.use("/v1/api/", apiRoutes);
(async () => {
  try {
    // using mongoose
    await connection();
    await initializeDefaultAccounts();
    app.listen(port, hostname, () => {
      console.log(`Example app listening on port ${port}`);
    });
  } catch (error) {
    console.log("error connect to server:>> ", error);
  }
})();
