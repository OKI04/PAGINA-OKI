const { Schema, model } = require('mongoose');

const EstampadoSchema = Schema({
    codigo: {
        type: String,
        required: true
    },
    imagenRef: {
        type: String,
        default: "default.png"
    },
    imagenes: [
        {
          url: {
            type: String,
            default: "default.png"
          },
          orden: {
            type: Number,
            required: true
          }
        }
    ]
})

const ColorSchema = Schema({
    codigo: {
        type: String,
        required: true
    },
    imagenRef: {
        type: String,
        default: "default.png"
    },
    imagenes: [
        {
          url: {
            type: String,
            default: "default.png"
          },
          orden: {
            type: Number,
            required: true
          }
        }
    ]
})

const TallasSchema = Schema({
    S: {
        type: Number,
        required: true
    },
    M: {
        type: Number,
        required: true
    },
    L: {
        type: Number,
        required: true
    }, 
    XL: {
        type: Number,
        required: true
    },
    U: {
        type: Number,
        required: true
    }
})

const ProductoSchema = Schema({
    referencia: {
        type: String,
        required: true
    },
    categoria: {
        type: String,
        required: true
    },
    nombre: {
        type: String,
        required: true
    },
    descripcion: {
        type: String
    }, 
    tallas: TallasSchema,
    colores: {
        type: [ColorSchema]
    },
    estampados: {
        type: [EstampadoSchema]
    },
    precio: {
        type: Number,
        required: true
    }
});

module.exports = model("Producto", ProductoSchema, "productos");