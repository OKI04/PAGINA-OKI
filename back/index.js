const {connection} = require("./database/connection");
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const path = require("path");
require("dotenv").config();
//Inicializar app
console.log("App de node arrancada");

//Conectar a la base de datos
connection();

//Servidor
const app = express();
const port = process.env.PORT || 3900;

app.use(cors({
  origin: ['http://localhost:5173', 'https://catalogo-virtual-oki.onrender.com'], // frontend en local y producción
  credentials: true
}));

//Middlewares
app.use(cors()); //Configurar CORS
app.use(express.json()); //recibir datos con contentType app/json
app.use(express.urlencoded({extended: false})); //Obtener los datos en x-www-form
app.use(morgan('dev')); //Muestra un resumen de la peticion HTTP por consola
app.use(cookieParser()); //Permite ver las cookies por consola
app.use("/imagenes", express.static(path.join(__dirname, "imagenes")));

//Rutas
const user_rutas = require("../back/routers/auth.routes");
const productos_rutas = require("../back/routers/productos.routes");
const carrusel_rutas = require("../back/routers/carrusel.routes");

app.use("/admin", user_rutas);
app.use("/admin/products", productos_rutas);
app.use("/admin/carrusel/products", carrusel_rutas);

//Crear servidor y escuchar peticiones http
app.listen(port, () => {
    console.log("Servidor corriendo en el puerto: " + port);
});