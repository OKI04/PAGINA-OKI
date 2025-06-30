const { connection } = require("./database/connection");
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const path = require("path");
require("dotenv").config();

// Inicializar app
console.log("App de node arrancada");
connection();

const app = express();
const port = process.env.PORT || 3900;

// ✅ CORS correcto
app.use(cors({
  origin: ['http://localhost:5173', 'https://catalogo-virtual-oki.onrender.com'],
  credentials: true
}));

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(morgan('dev'));
app.use(cookieParser());
app.use("/imagenes", express.static(path.join(__dirname, "imagenes")));

// Rutas
const user_rutas = require("../back/routers/auth.routes");
const productos_rutas = require("../back/routers/productos.routes");
const carrusel_rutas = require("../back/routers/carrusel.routes");

app.use("/admin", user_rutas);
app.use("/admin/products", productos_rutas);
app.use("/admin/carrusel/products", carrusel_rutas);

// Servidor
app.listen(port, () => {
  console.log("Servidor corriendo en el puerto: " + port);
});
