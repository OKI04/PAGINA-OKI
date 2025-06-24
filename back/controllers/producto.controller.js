const Product = require("../models/producto.model.js");
const JoiSchema = require("../helpers/validarProducto.js");
const fs = require('fs');
const path = require('path');


const allProducts = async (req, res) => {

    const products = await Product.find();
    return res.status(200).json(products)

}

const oneProduct = async (req, res) => {

  try {
    const id = req.params.id;
    const product = await Product.findById(id); // ya no se usa callback
    if (!product) return res.status(404).json({ message: "Producto no encontrado" });

    return res.status(200).json({ 
      status: "success",
      product,
      mesaje: "Producto encontrado"
    });

  } catch (error) {
    res.status(500).json({ message: "Error del servidor", error });
  }
  
}


const createProduct = async (req, res) => {

  console.log(req.body);

    try {
        
        const {
          referencia,
          categoria,
          nombre,
          descripcion,
          precio,
          tallas,
        } = req.body;
    
        console.log("-------------------------------------------------------");
        console.log("-------------------------------------------------------");
        console.log("Body: ", req.body);
        console.log("-------------------------------------------------------");
        console.log("-------------------------------------------------------");
        console.log("File: ", req.files);
        console.log("-------------------------------------------------------");
        console.log("-------------------------------------------------------");
    
        // Parseamos tallas si llega como JSON (form-data lo manda como texto)
        const parsedTallas = JSON.parse(tallas);
    
        const keys = Object.keys(req.body);
        console.log("KEys: ", keys);
        console.log("-------------------------------------------------------");
        console.log("-------------------------------------------------------");

        //----------------------------------------

        const clavesCodigoColor = Object.keys(req.body).filter(key =>
          key.startsWith("colores[") && key.endsWith(".codigo")
        );
        
        const clavesOrdenadas = clavesCodigoColor.sort((a, b) => {
          const iA = parseInt(a.match(/\[(\d+)\]/)[1]);
          const iB = parseInt(b.match(/\[(\d+)\]/)[1]);
          return iA - iB;
        });
        
        let colores = clavesOrdenadas.map((clave, i) => ({
          codigo: req.body[clave],
          imagenRef: req.body[`colores[${i}].imagenRef`],     
          imagenes: []     
        }));

        const clavesCodigoEstampado = Object.keys(req.body).filter(key =>
          key.startsWith("estampados[") && key.endsWith(".codigo")
        );


        const clavesEstampadoOrdenadas = clavesCodigoEstampado.sort((a, b) => {
          const iA = parseInt(a.match(/\[(\d+)\]/)[1]);
          const iB = parseInt(b.match(/\[(\d+)\]/)[1]);
          return iA - iB;
        });

        let estampados = clavesEstampadoOrdenadas.map((clave, i) => ({
          codigo: req.body[clave],
          imagenRef: req.body[`estampados[${i}].imagenRef`],      
          imagenes: []        
        }));

        console.log("Colores antes de Imagenes: ", colores);
        console.log("-------------------------------------------------------");
        console.log("-------------------------------------------------------");

        console.log("Estampados antes de Imagenes: ", estampados);
        console.log("-------------------------------------------------------");
        console.log("-------------------------------------------------------");
        
        let coloresFinal = {};
        let estampadosFinal = {};
        
        if (req.files) {

          for(let i = 0; i < req.files.length; i++){
            
            const file = req.files[i];
            if (file.fieldname.startsWith("colores[")){

              let match = req.files[i].fieldname.match(/\[(\d+)\]/);;

              if (match) {

                const index = match[1]; 
          
                if (!coloresFinal[index]) {
                  coloresFinal[index] = [];
                }

                const imagenRef = req.body[`colores[${index}].imagenRef`];

        // Determinar el orden
                let orden = 1;
                if (file.originalname !== imagenRef) {
                  const cantidadSecundarias = coloresFinal[index].filter(img => img.orden !== 1).length;
                  orden = cantidadSecundarias + 2;
                }

                const imagen = {
                  url: file.path,
                  orden: orden 
                };

                coloresFinal[index].push(imagen);

              }

            } else {

              let match = req.files[i].fieldname.match(/\[(\d+)\]/);;

              if (match) {

                const index = match[1]; 
          
                if (!estampadosFinal[index]) {
                  estampadosFinal[index] = [];
                }

                const imagenRef = req.body[`estampados[${index}].imagenRef`];

                let orden = 1;
                if (file.originalname !== imagenRef) {
                  const cantidadSecundarias = estampadosFinal[index].filter(img => img.orden !== 1).length;
                  orden = cantidadSecundarias + 2;
                }

                const imagen = {
                  url: file.path,
                  orden: orden 
                };

                estampadosFinal[index].push(imagen);
              }

            }

          }

        }
          console.log("estampadosFinal: ", estampadosFinal);

          console.log("-------------------------------------------------------");
          console.log("-------------------------------------------------------");

          console.log("coloresFinal: ", coloresFinal);


          // 1. tomar el array de colores
          // 2. tomar el array de coloresFinal
          // 3. tomar el primer elemento de coloresFInal y meterlo en el primer elemento de colores.imagenes

          for(let i = 0; i < colores.length; i++){
            colores[i].imagenes = coloresFinal[i];
          }

          for(let i = 0; i < estampados.length; i++){
            estampados[i].imagenes = estampadosFinal[i];
          }

          console.log("Colores listos: ", colores);
          console.log("Estampados listos: ", estampados);

        //--------------------------------------------

        const { error } = JoiSchema.productJoiSchema.validate({
          referencia,
          categoria,
          nombre,
          descripcion,
          precio: Number(precio),
          tallas: parsedTallas,
          colores,
          estampados
        }, { abortEarly: false });
    
        if (error) {
          console.log("Error Joi:", error);
          return res.status(400).json({
            message: "Error de validación",
            errors: error.details.map(err => err.message)
          });
        }
    
        console.log("Validación completa");
    
        const newProduct = new Product({
          referencia,
          categoria,
          nombre,
          descripcion,
          precio,
          tallas: parsedTallas,
          colores,
          estampados
        });
    
        const saved = await newProduct.save();
        console.log("Producto guardado");
        return res.status(201).json(saved);
      } catch (err) {
        console.error("Error en creación:", err);
        return res.status(500).json({ message: "Error en el servidor", error: err.message });
      }
}

const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("Actualizando producto ID:", id);
    console.log(req.body);
    console.log("------------------------------------------------------------");
    console.log("------------------------------------------------------------");
    console.log(req.files);
    console.log("------------------------------------------------------------");
    console.log("------------------------------------------------------------");

    //Verificar si el producto existe
    const existingProduct = await Product.findById(id);
    if (!existingProduct) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }


    // Parsear tallas si viene en el body
    const parsedTallas = {
      S: parseInt(req.body['tallas.S']) || 0,
      M: parseInt(req.body['tallas.M']) || 0,
      L: parseInt(req.body['tallas.L']) || 0,
      XL: parseInt(req.body['tallas.XL']) || 0,
      U: parseInt(req.body['tallas.U']) || 0
    };

    // Procesar colores
    let colores = [];
    const colorKeys = Object.keys(req.body).filter(key => 
      key.startsWith("colores[") && key.includes(".codigo")
    );

    colorKeys.forEach(key => {
      const match = key.match(/colores\[(\d+)\]\.codigo/);
      if (match) {
        const index = parseInt(match[1]);
        colores[index] = {
          codigo: req.body[key],
          imagenRef: req.body[`colores[${index}].imagenRef`],
          imagenes: existingProduct.colores[index]?.imagenes || [] // Mantener imágenes existentes
        };
      }
    });


    // Procesar estampados
    let estampados = [];
    const estampadoKeys = Object.keys(req.body).filter(key => 
      key.startsWith("estampados[") && key.includes(".codigo")
    );

    estampadoKeys.forEach(key => {
      const match = key.match(/estampados\[(\d+)\]\.codigo/);
      if (match) {
        const index = parseInt(match[1]);
        estampados[index] = {
          codigo: req.body[key],
          imagenRef: req.body[`estampados[${index}].imagenRef`],
          imagenes: existingProduct.estampados[index]?.imagenes || [] // Mantener imágenes existentes
        };
      }
    });

    
    // Procesamiento de archivos
    if (req.files && req.files.length > 0) {
      const fs = require('fs');
      const path = require('path');
      
      // Paso 1: Identificar índices de colores/estampados con nuevas imágenes
      const indicesToReplace = {
        colores: new Set(),
        estampados: new Set()
      };
    
      req.files.forEach(file => {
        const match = file.fieldname.match(/(colores|estampados)\[(\d+)\]/);
        if (match) {
          const type = match[1];
          const index = match[2];
          indicesToReplace[type].add(index);
        }
      });
    
      // Paso 2: Eliminar todas las imágenes existentes para estos índices
      indicesToReplace.colores.forEach(index => {
        if (colores[index] && colores[index].imagenes) {
          // Eliminar archivos físicos
          colores[index].imagenes.forEach(img => {
            const filePath = path.join(__dirname, '..', img.url);
            if (fs.existsSync(filePath)) {
              fs.unlinkSync(filePath);
              console.log(`Archivo eliminado: ${filePath}`);
            }
          });
          // Limpiar array de imágenes
          colores[index].imagenes = [];
        }
      });
    
      indicesToReplace.estampados.forEach(index => {
        if (estampados[index] && estampados[index].imagenes) {
          // Eliminar archivos físicos
          estampados[index].imagenes.forEach(img => {
            const filePath = path.join(__dirname, '..', img.url);
            if (fs.existsSync(filePath)) {
              fs.unlinkSync(filePath);
              console.log(`Archivo eliminado: ${filePath}`);
            }
          });
          // Limpiar array de imágenes
          estampados[index].imagenes = [];
        }
      });
    
      // Paso 3: Procesar nuevas imágenes
      req.files.forEach(file => {
        const match = file.fieldname.match(/(colores|estampados)\[(\d+)\]/);
        if (match) {
          const type = match[1];
          const index = match[2];
          const isRefImage = file.fieldname.includes('.imagenRef');
          
          const imageData = {
            url: file.path,
            orden: isRefImage ? 1 : 0 // Orden temporal
          };
    
          if (type === 'colores') {
            if (!colores[index]) colores[index] = { imagenes: [] };
            colores[index].imagenes.push(imageData);
          } else if (type === 'estampados') {
            if (!estampados[index]) estampados[index] = { imagenes: [] };
            estampados[index].imagenes.push(imageData);
          }
        }
      });
    
      // Paso 4: Asignar órdenes correctos
      const assignOrders = (items) => {
        items.forEach(item => {
          if (item && item.imagenes) {
            // Encontrar imagenRef (si existe)
            const refImageIndex = item.imagenes.findIndex(img => img.orden === 1);
            let refImage = null;
            
            if (refImageIndex !== -1) {
              refImage = item.imagenes.splice(refImageIndex, 1)[0];
            }
            
            // Ordenar el resto por nombre de archivo
            item.imagenes.sort((a, b) => a.url.localeCompare(b.url));
            
            // Asignar órdenes
            if (refImage) {
              refImage.orden = 1;
              item.imagenes.unshift(refImage);
            }
            
            item.imagenes.forEach((img, idx) => {
              if (!img.orden || img.orden !== 1) {
                img.orden = refImage ? idx + 1 : idx;
              }
            });
          }
        });
      };
    
      assignOrders(colores);
      assignOrders(estampados);
    }


    // Preparar datos de actualización
    const updateData = {
      referencia: req.body.referencia || existingProduct.referencia,
      categoria: req.body.categoria || existingProduct.categoria,
      nombre: req.body.nombre || existingProduct.nombre,
      descripcion: req.body.descripcion || existingProduct.descripcion,
      precio: req.body.precio || existingProduct.precio,
      tallas: parsedTallas,
      colores: colores.filter(Boolean), // Eliminar índices vacíos
      estampados: estampados.filter(Boolean)
    };

    
    console.log("Datos actualizados: ", updateData);
    updateData.colores.forEach(file => {
      console.log(file);
    });

    console.log("-----------------------------------------------");
    updateData.estampados.forEach(file => {
      console.log(file);
    });

    // Validación
    // 7. Validación: asegurar que cada color y estampado tenga imagen de referencia (orden 1)
    const validationErrors = [];
    updateData.colores.forEach((color, index) => {
      if (!color.imagenes || !color.imagenes.some(img => img.orden === 1)) {
      validationErrors.push(`El color ${color.codigo} (índice ${index}) no tiene imagen de referencia (orden 1)`);
      }
    });
    updateData.estampados.forEach((estampado, index) => {
      if (!estampado.imagenes || !estampado.imagenes.some(img => img.orden === 1)) {
        validationErrors.push(`El estampado ${estampado.codigo} (índice ${index}) no tiene imagen de referencia (orden 1)`);
      }
    });

    if (validationErrors.length > 0) {
      return res.status(400).json({
      message: "Error de validación",
      errors: validationErrors
      });
    }

    const { error } = JoiSchema.updateProductJoiSchema.validate(updateData, { 
      abortEarly: false,
      allowUnknown: true // Permitir propiedades adicionales
    });

    // Actualizar producto
    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    return res.status(200).json(updatedProduct);

  } catch (err) {
    console.error("Error en actualización:", err);
    return res.status(500).json({ 
      message: "Error en el servidor", 
      error: err.message 
    });
  }
};

const deleteProduct = async (req, res) => {

  let articulo_id = req.params.id;
  console.log("Producto a eliminar: " + articulo_id);

  try {
    
    const productoBorrado = await Product.findByIdAndDelete(articulo_id);

    if(!productoBorrado){
      return res.status(500).json({
        status: "error",
        mesaje: "Error al borrar"
      })
    }

    return res.status(200).json({ 
      status: "success",
      prodducto: productoBorrado,
      mesaje: "Producto borrado"
    });

  } catch (error) {

    res.status(500).json({ message: 'Error al eliminar el producto', error: error });

  }
     
}

const procesoCompra = async (req, res) => {

  //Obtener lista

  //Transformar lista

  //Mensaje

  //Enviar mensaje

}

module.exports = {
    createProduct,
    allProducts,
    oneProduct,
    updateProduct,
    deleteProduct,
    procesoCompra
}