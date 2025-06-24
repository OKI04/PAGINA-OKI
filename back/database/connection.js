const mongoose = require("mongoose");
require("dotenv").config();

const uri = process.env.MONGO_URI;

const connection = async () => {
    try {
        await mongoose.connect(uri); // ← limpio y actualizado
        console.log("Conectado a MongoDB Atlas");
    } catch (error) {
        console.log(error);
        throw new Error("No se ha podido conectar a la base de datos");
    }
};

module.exports = {
    connection
};
