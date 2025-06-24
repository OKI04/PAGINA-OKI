const express = require('express');
const routes = express.Router();
const validateToken = require("../middlewares/validateToken");
const carruselController = require("../controllers/carrusel.controller");

routes.get("/carrusel", carruselController.getCarrusel);
routes.post("/create/item", validateToken.authRequired, carruselController.createCarrusel);
routes.delete("/delete/item", validateToken.authRequired, carruselController.deleteItemCarrusel);

module.exports = routes;