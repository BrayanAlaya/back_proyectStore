const express = require("express")
const authMiddleware = require("../middleware/authenticaded");
const productController = require("../controllers/productController");

let app = express();

app.post("/", authMiddleware, productController.save);
app.get("/", productController.getBySearch) //query = user=(int id), category=(int id), name=(string), page=(int) 
app.put("/:id", authMiddleware, productController.update)
app.delete("/:id", authMiddleware, productController.delete)

module.exports = app;
