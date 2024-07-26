const express = require("express");
const notificacionsController = require("../controllers/notificacionsController");
const authMiddlewate = require("../middleware/authenticaded")

const app = express();

app.post("/", notificacionsController.create);
app.get("/:page", authMiddlewate, notificacionsController.getByUser);
app.put("/read/:id", authMiddlewate ,notificacionsController.updateRead);

module.exports = app;