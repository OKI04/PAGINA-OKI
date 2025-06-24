const express = require("express");
const multer = require("multer");
const productoController = require("../controllers/producto.controller");
const validateToken = require("../middlewares/validateToken");

const router = express.Router();

const almacenamiento = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './imagenes/productos/');
    },

    filename: (req, file, cb) => {
        cb(null, "producto" + file.originalname);
    }
})

const imagenes = multer({ storage: almacenamiento });


router.get("/all", productoController.allProducts);
router.post("/create", [
  validateToken.authRequired,
  imagenes.any()
], productoController.createProduct);

router.put("/update/:id", [
  validateToken.authRequired,
  imagenes.any()
], productoController.updateProduct);
  
router.delete("/delete/:id", validateToken.authRequired, productoController.deleteProduct);
router.get("/one/:id", validateToken.authRequired, productoController.oneProduct);
router.post("/sale", productoController.procesoCompra);

module.exports = router;
