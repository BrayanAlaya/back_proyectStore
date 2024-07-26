const express = require("express")
const authMiddleware = require("../middleware/authenticaded");
const productController = require("../controllers/productController");

let app = express();

app.post("/", authMiddleware, productController.save);
app.get("/user/:id/:page", productController.getByUserId);
app.get("/category/:id/:page", productController.getByCategoryId)
app.put("/:id", authMiddleware ,productController.update)
app.delete("/:id", authMiddleware , productController.delete)

module.exports = app;
