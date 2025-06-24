const { Schema, model } = require('mongoose')

const CarruselItemSchema = new Schema({
    referencia: {
      type: String,
      required: true,
    },
    tipo: {
      type: String,
      required: true
    },
    codigo: {
      type: String,
      default: null,
    },
});
  
const CarruselSchema = new Schema({
    productos: [CarruselItemSchema], // Lista de productos para el carrusel
});

module.exports = model("CarruselItems", CarruselSchema, "CarruselItems");