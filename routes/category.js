const express = require("express");

const controller = require("../controllers/categoryController");
const authenticaded = require("../middleware/authenticaded");
const isAdmin = require("../middleware/isAdmin");

const app = express();

app.post("/", authenticaded, isAdmin ,controller.createCategory);
app.put("/:id", authenticaded, isAdmin ,controller.updateCategory);
app.get("/",controller.getCategories);
app.get("/:id", controller.getCategory)

module.exports = app;