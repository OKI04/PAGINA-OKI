export default function capturarDatosProducto() {
    const form = document.getElementById('createProductForm');
    const formData = {};
  
    // Capturar campos de texto y textarea
    formData.referencia = form.querySelector('[name="referencia"]').value;
    formData.categoria = form.querySelector('[name="categoria"]').value;
    formData.nombre = form.querySelector('[name="nombre"]').value;
    formData.descripcion = form.querySelector('[name="descripcion"]').value;
    formData.precio = parseFloat(form.querySelector('[name="precio"]').value); // Convertir a número
  
    // Capturar tallas
    formData.tallas = {};
    formData.tallas.S = parseInt(form.querySelector('[name="tallas.S"]').value) || 0;
    formData.tallas.M = parseInt(form.querySelector('[name="tallas.M"]').value) || 0;
    formData.tallas.L = parseInt(form.querySelector('[name="tallas.L"]').value) || 0;
    formData.tallas.XL = parseInt(form.querySelector('[name="tallas.XL"]').value) || 0;
    formData.tallas.U = parseInt(form.querySelector('[name="tallas.U"]').value) || 0;
  
    // Capturar colores (maneja múltiples inputs)
    formData.colores = [];
    const colorContainers = document.querySelectorAll('#colorsContainer .row.g-3.align-items-center.mb-2');
    colorContainers.forEach(container => {
      const codigoColorInput = container.querySelector('[name="codigoColor"]');
      const colorFileInput = container.querySelector('[name="colores"]');
      if (codigoColorInput && colorFileInput && codigoColorInput.value && colorFileInput.files[0]) {
        formData.colores.push({
          codigo: codigoColorInput.value,
          archivo: colorFileInput.files[0]
        });
      } else if (codigoColorInput && codigoColorInput.value) {
        formData.colores.push({ codigo: codigoColorInput.value });
      } else if (colorFileInput && colorFileInput.files[0]) {
        formData.colores.push({ archivo: colorFileInput.files[0] });
      }
    });

    console.log("colores en form: " + JSON.stringify(formData.colores));
  
    // Capturar estampados (maneja múltiples inputs)
    formData.estampados = [];
    const printsContainers = document.querySelectorAll('#printsContainer .row.g-3.align-items-center.mb-2');
    printsContainers.forEach(container => {
      const codigoEstampadoInput = container.querySelector('[name="codigoEstampado"]');
      const estampadoFileInput = container.querySelector('[name="estampados"]');
      if (codigoEstampadoInput && estampadoFileInput && codigoEstampadoInput.value && estampadoFileInput.files[0]) {
        formData.estampados.push({
          codigo: codigoEstampadoInput.value,
          archivo: estampadoFileInput.files[0]
        });
      } else if (codigoEstampadoInput && codigoEstampadoInput.value) {
        formData.estampados.push({ codigo: codigoEstampadoInput.value });
      } else if (estampadoFileInput && estampadoFileInput.files[0]) {
        formData.estampados.push({ archivo: estampadoFileInput.files[0] });
      }
    });
  
    // Capturar imágenes principales (maneja múltiples inputs con el mismo nombre)
    formData.imagenes = [];
    const imagenesFiles = form.querySelectorAll('[name="imagenes"]');
    imagenesFiles.forEach(fileInput => {
      if (fileInput.files[0]) {
        formData.imagenes.push(fileInput.files[0]);
      }
    });
  
    return formData;
  }