const express = require("express");
const controller = require("../controllers/userController");
const middlewareAuth = require("../middleware/authenticaded")
const authCode = require("../middleware/authCode")

const app = express();


app.post("/register", controller.register);
app.post("/login", controller.login);

app.post("/code", controller.authCode);
app.post("/code/create-code", controller.createCode)
app.post("/code/auth-account", authCode, controller.authAccount)
app.post("/code/change-password", authCode ,controller.changePassword)

app.get("/getUser/:id", controller.getUser);
app.put("/update", middlewareAuth ,controller.update);
app.delete("/delete", middlewareAuth ,controller.delete);

module.exports = app;
