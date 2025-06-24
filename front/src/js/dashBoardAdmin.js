// Archivo: adminProducts.js

let productosCargados = [];
let formularioId = 0;
const arrayList = [];

//Crear Usuario
const userForm = document.getElementById('formRegister');
userForm?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const nombre = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  const res = await fetch('/admin/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nombre, email, password })
  });

  if (!res.ok) {
    const error = await res.json();
    console.error('Error al registrar:', error);
    return;
  }

  const data = await res.json();
  console.log('Usuario creado:', data);
});


window.loadProducts = async function loadProducts() {
  try {
    const res = await fetch('/admin/products/all', {
      method: 'GET',
      credentials: 'include'
    });

    if (!res.ok) {
      const err = await res.text();
      mostrarAlerta('Error al cargar productos: ' + err);
      return;
    }

    const baseApiUrl = "http://localhost:3900";
    const productos = await res.json();

    productosCargados = productos.map(prod => {
      // Normalizar imágenes principales
      const imagenesNorm = (prod.imagenes || []).map(img => {
        const rutaLimpia = img.url.replace(/\\/g, "/");
        return {
          ...img,
          url: rutaLimpia,
          publicUrl: `${baseApiUrl}/${rutaLimpia}`
        };
      });

      // Normalizar colores (cada uno puede tener imagenes[])
      const coloresNorm = (prod.colores || []).map(color => {
        const imagenesColor = (color.imagenes || []).map(img => {
          const rutaLimpia = img.url.replace(/\\/g, "/");
          return {
            ...img,
            url: rutaLimpia,
            publicUrl: `${baseApiUrl}/${rutaLimpia}`
          };
        });

        return {
          ...color,
          imagenes: imagenesColor,
          publicUrl: imagenesColor[0]?.publicUrl || '' // para vista previa
        };
      });

      // Normalizar estampados (cada uno puede tener imagenes[])
      const estampadosNorm = (prod.estampados || []).map(estampado => {
        const imagenesEst = (estampado.imagenes || []).map(img => {
          const rutaLimpia = img.url.replace(/\\/g, "/");
          return {
            ...img,
            url: rutaLimpia,
            publicUrl: `${baseApiUrl}/${rutaLimpia}`
          };
        });

        return {
          ...estampado,
          imagenes: imagenesEst,
          publicUrl: imagenesEst[0]?.publicUrl || ''
        };
      });

      return {
        ...prod,
        imagenes: imagenesNorm,
        colores: coloresNorm,
        estampados: estampadosNorm
      };
    });

    const loader = document.getElementById("loader");
    if(loader){
      loader.remove();
    }
    productosCargados.sort((a, b) => b._id.localeCompare(a._id));


    // Renderizar en tabla
    const tbody = document.getElementById("productTable");
    tbody.innerHTML = productosCargados.map(p => `
      <tr class="fila-producto" data-id="${p._id}" data-referencia="${p.referencia}">
        <td>${p.referencia}</td>
        <td>${p.categoria}</td>
        <td>${p.nombre}</td>
        <td>
          ${['S', 'M', 'L', 'XL', 'U'].filter(t => p.tallas[t] > 0).join(' - ')}
        </td>
        <td>$${p.precio}</td>
        <td>${(p.colores || []).map(c => c.codigo).join(' - ') || '-'}</td>
        <td>${(p.estampados || []).map(e => e.codigo).join(' - ') || '-'}</td>
        <td>
          <button class="btn btn-primary btn-sm" data-action="ver" data-id="${p._id}">Ver</button>
          <button class="btn btn-success btn-sm" data-action="editar" data-id="${p._id}">Editar</button>
          <button class="btn btn-danger btn-sm" data-id="${p._id}" data-bs-toggle="modal" data-action="eliminar" data-bs-target="#modalDelete">Eliminar</button>
        </td>
      </tr>`).join('');

    // Asignar eventos
    tbody.querySelectorAll('button[data-action]').forEach(btn => {
      btn.addEventListener('click', () => {
        const action = btn.dataset.action;
        const id = btn.dataset.id;
        if (action === "ver") view(id);
        else if (action === "editar") openEditModal(id);
        else if (action === "eliminar") {
          document.getElementById('btn-confirmar-eliminar').addEventListener('click', function () {
            if (id) {
              eliminar(id);
            }
          });
          
        }
      });
    });

  } catch (error) {
    console.log('Error al cargar productos:', error);
    console.log('Error al cargar productos');
  }
};

// Crear Producto
document.getElementById("createProductForm").addEventListener("submit", async e => {
  e.preventDefault();

  const form = e.target;
  const formData = new FormData();

  // Datos generales
  formData.append("referencia", form.referencia.value);
  formData.append("categoria", form.categoria.value);
  //formData.append("otraCategoria", form.otraCategoria.value);
  formData.append("nombre", form.nombre.value);
  formData.append("descripcion", form.descripcion.value);
  formData.append("precio", form.precio.value);

  // Tallas
  const tallas = {
    S: form["tallas.S"].value || "0",
    M: form["tallas.M"].value || "0",
    L: form["tallas.L"].value || "0",
    XL: form["tallas.XL"].value || "0",
    U: form["tallas.U"].value || "0"
  };
  formData.append("tallas", JSON.stringify(tallas));

  const colores = recolectarDatosGrupo("#colorContainer", {
    codigo: ".color-codigo",
    nombreRef: ".color-nombre-ref",
    imagenRefFile: "input[name='colorRef']",
    imagenes: "input[name='colores']"
  });

  const estampados = recolectarDatosGrupo("#printsContainer", {
    codigo: ".estampado-codigo",
    imagenRef: ".estampado-nombre-ref",
    imagenRefFile: "input[name='estampadoRef']",
    imagenes: "input[name='estampados']"
  });
  

  // FUNCIONES AUXILIARES:

  const hayColores = colores;
  const hayEstampados = estampados;

  if (!hayColores && !hayEstampados) {
    mostrarAlerta("Debe agregar al menos un color o un estampado que tenga al menos una imagen.");
    return;
  }

  colores.forEach((color, index) => {
    formData.append(`colores[${index}].codigo`, color.codigo);
    formData.append(`colores[${index}].imagenRef`, color.nombreRef);

    if (color.imagen) {
      formData.append(`colores[${index}]`, color.imagen);
    }

    if (Array.isArray(color.imagenes)) {
      console.log("Colores: ", color.imagenes);
      color.imagenes.forEach((img, i) => {
        formData.append(`colores[${index}]`, img);
      });
    }
  });

  estampados.forEach((estampado, index) => {
    formData.append(`estampados[${index}].codigo`, estampado.codigo);
    formData.append(`estampados[${index}].imagenRef`, estampado.nombreRef);

    if (estampado.imagen) {
      formData.append(`estampados[${index}]`, estampado.imagen);
    }
    
    if (Array.isArray(estampado.imagenes)) {
      console.log("Estampados: ", estampado.imagenes); 
      estampado.imagenes.forEach((img, i) => {
        formData.append(`estampados[${index}]`, img);
      });
    }
  });

  try {
        const res = await fetch('/admin/products/create', {
          method: 'POST',
          body: formData,
          credentials: 'include'       //si usas cookie HttpOnly
        });
    
        if (!res.ok) {
          const err = await res.json();
          mostrarAlerta('Error al crear producto: ' + (err.message || res.statusText));
          return;
        }
    
        const nuevoProducto = await res.json();
        console.log('Creado:', nuevoProducto);
    
        if (typeof loadProducts === 'function') {
          loadProducts();
        }
    
        // Limpiar formulario
        form.reset();

        // Limpiar contenedores dinámicos
        document.querySelector("#colorContainer").innerHTML = "";
        document.querySelector("#printsContainer").innerHTML = "";

        // Mostrar mensaje de éxito
        mostrarAlerta("Producto creado exitosamente.");
      } catch (error) {
        console.error('Error en fetch crear producto:', error);
        mostrarAlerta('Error de conexión al crear producto');
      }

});


// Buscador
const buscador = document.getElementById('searchInput');
buscador?.addEventListener('keyup', (e) => {
  const filtro = e.target.value.toLowerCase();
  document.querySelectorAll('.fila-producto').forEach(fila => {
    const referencia = fila.dataset.referencia.toLowerCase();
    fila.style.display = referencia.includes(filtro) ? '' : 'none';
  });
});

// Cargar productos al iniciar
document.addEventListener('DOMContentLoaded', () => {
  if (window.loadProducts) {
    window.loadProducts();
  }
});

// Eliminar Producto
async function eliminar(_id) {
  console.log("action: eliminar");
  console.log("Id url: " + _id);
   try {
    
     const res = await fetch(`/admin/products/delete/${_id}`, {
       method: 'DELETE',
       credentials: 'include'    // si usas cookie HttpOnly
     });

     if (!res.ok) {
       const err = await res.text();
       mostrarAlerta('Error al cargar productos: ' + err);
       return;
     }

     const productoDelete = await res.json();
     console.log(productoDelete);
     loadProducts();

   } catch (error) {
     console.error('Error en loadProducts:', error);
     mostrarAlerta('El producto no fue eliminado');
   }
}
// Ver producto
async function view(id) {
  const unicoProducto = productosCargados.find(p => p._id === id);
  if (!unicoProducto) {
    mostrarAlerta("Producto no encontrado");
    return;
  }

  let imagenes = [];

  // Mostrar primero las imágenes del primer color, luego estampado, luego base
  if (unicoProducto.colores?.length && unicoProducto.colores[0].imagenes?.length) {
    imagenes = unicoProducto.colores[0].imagenes;
  } else if (unicoProducto.estampados?.length && unicoProducto.estampados[0].imagenes?.length) {
    imagenes = unicoProducto.estampados[0].imagenes;
  } else {
    imagenes = unicoProducto.imagenes || [];
  }

  let principal = imagenes[1]?.publicUrl || imagenes[0]?.publicUrl || '';
  let secundarias = imagenes.slice(1);

  const modalBody = document.querySelector('#modalView .modal-body');
  modalBody.innerHTML = `
    <div class="plantilla">
      <div class="plantilla-container">
        <div class="imagen-y-miniaturas">
          <div class="imagenes-secundarias" id="imagenesSecundarias"></div>
          <div class="imagen-principal">
            <img id="mainImage" class="main-image" src="${principal}" alt="Imagen principal" style="max-width:100%;" />
          </div>
        </div>
        <div class="detalles-producto">
          <div class="nombre-modelo">${unicoProducto.nombre}</div>
          <div class="referencia">Referencia: ${unicoProducto.referencia}</div>
          <div class="precio">$${Number(unicoProducto.precio).toLocaleString('es-CO')}</div>
          ${unicoProducto.colores?.length ? `
            <div class="colores">
              <div class="lista-colores"></div>
              <div class="colores-container">
                ${unicoProducto.colores.map((color, index) => `
                  <div class="color-item">
                    <img src="${color.publicUrl || ''}" alt="${color.codigo}" class="color-imagen"
                      data-tipo="color" data-index="${index}" style="cursor: pointer;" />
                    <div class="color-codigo">${color.codigo}</div>
                  </div>
                `).join('')}
              </div>
            </div>` : ''}
          ${unicoProducto.estampados?.length ? `
            <div class="estampados">
              <div class="lista-colores"></div>
              <div class="colores-container">
                ${unicoProducto.estampados.map((estampado, index) => `
                  <div class="color-item">
                    <img src="${estampado.publicUrl || ''}" alt="${estampado.codigo}" class="color-imagen estampado-imagen"
                      data-tipo="estampado" data-index="${index}" style="cursor: pointer;" />
                    <div class="color-codigo">${estampado.codigo}</div>
                  </div>
                `).join('')}
              </div>
            </div>` : ''}
          <div class="lista-colores"><strong>TALLA</strong></div>
          <div class="talla">
            ${mostrarSiTieneValor(unicoProducto.tallas?.S, 'S')}
            ${mostrarSiTieneValor(unicoProducto.tallas?.M, 'M')}
            ${mostrarSiTieneValor(unicoProducto.tallas?.L, 'L')}
            ${mostrarSiTieneValor(unicoProducto.tallas?.XL, 'XL')}
            ${mostrarSiTieneValor(unicoProducto.tallas?.U, 'U')}
          </div>
        ${unicoProducto.descripcion ? `
          <div class="descripcion-container" style="margin-top: 1rem;">
            <div class="lista-colores">DESCRIPCIÓN</div>
            <div class="descripcion">${unicoProducto.descripcion}</div>
          </div>
        ` : ''}
      </div>
    </div>
  </div>
`;

  const modal = new bootstrap.Modal(document.getElementById('modalView'));
  modal.show();

  // Mostrar miniaturas iniciales
  actualizarMiniaturas(secundarias);

  // Clic en color
  modalBody.querySelectorAll('.color-imagen').forEach(img => {
    img.addEventListener('click', () => {
      const index = parseInt(img.dataset.index);
      const color = unicoProducto.colores[index];
      if (!color?.imagenes?.length) return;

      const imgPrincipal = color.imagenes[1]?.publicUrl || color.imagenes[0]?.publicUrl || '';
      const imgSecundarias = color.imagenes.slice(1);

      cambiarImagen(imgPrincipal);
      actualizarMiniaturas(imgSecundarias);
    });
  });

  // Clic en estampado
  modalBody.querySelectorAll('.estampado-imagen').forEach(img => {
    img.addEventListener('click', () => {
      const index = parseInt(img.dataset.index);
      const estampado = unicoProducto.estampados[index];
      if (!estampado?.imagenes?.length) return;

      const imgPrincipal = estampado.imagenes[1]?.publicUrl || estampado.imagenes[0]?.publicUrl || '';
      const imgSecundarias = estampado.imagenes.slice(1);

      cambiarImagen(imgPrincipal);
      actualizarMiniaturas(imgSecundarias);
    });
  });

  function actualizarMiniaturas(imagenes) {
    const contenedor = modalBody.querySelector('#imagenesSecundarias');
    contenedor.innerHTML = imagenes.map(img => `
      <img src="${img.publicUrl}" class="miniatura" style="cursor:pointer; max-width: 50px; margin-right:5px;" />
    `).join('');

    contenedor.querySelectorAll('img.miniatura').forEach(imgMini => {
      imgMini.addEventListener('click', () => {
        cambiarImagen(imgMini.src);
      });
    });
  }

  function cambiarImagen(url) {
    const imgMain = modalBody.querySelector('#mainImage');
    if (imgMain) imgMain.src = url;
  }
}

// Editar Producto
function openEditModal(productId) {
  // Limpiar contenedores
  document.getElementById('editColorContainer').innerHTML = '';
  document.getElementById('editPrintsContainer').innerHTML = '';
  
  // Obtener datos del producto
  fetch(`/admin/products/one/${productId}`, {
    credentials: 'include'
  })
  .then(response => response.json())
  .then(producto => {

    const baseApiUrl = "http://localhost:3900";
    console.log(producto);
    let product = producto.product;
    console.log(product);

    const imagenesNorm = (product.imagenes || []).map(img => {
        const rutaLimpia = img.url.replace(/\\/g, "/");
        return {
          ...img,
          url: rutaLimpia,
          publicUrl: `${baseApiUrl}/${rutaLimpia}`
        };
      });

      const coloresNorm = (product.colores || []).map(color => {
        const imagenesColor = (color.imagenes || []).map(img => {
          const rutaLimpia = img.url.replace(/\\/g, "/");
          return {
            ...img,
            url: rutaLimpia,
            publicUrl: `${baseApiUrl}/${rutaLimpia}`
          };
        });

        return {
          ...color,
          imagenes: imagenesColor,
          publicUrl: imagenesColor[0]?.publicUrl || '' // para vista previa
        };
      });

      // Normalizar estampados (cada uno puede tener imagenes[])
      const estampadosNorm = (product.estampados || []).map(estampado => {
        const imagenesEst = (estampado.imagenes || []).map(img => {
          const rutaLimpia = img.url.replace(/\\/g, "/");
          return {
            ...img,
            url: rutaLimpia,
            publicUrl: `${baseApiUrl}/${rutaLimpia}`
          };
        });

        return {
          ...estampado,
          imagenes: imagenesEst,
          publicUrl: imagenesEst[0]?.publicUrl || ''
        };
      });

      product = {
        ...product,
        imagenes: imagenesNorm,
        colores: coloresNorm,
        estampados: estampadosNorm
      };

    console.log(product);
    // Llenar campos básicos
    document.getElementById('editProductId').value = product._id;
    document.querySelector('#modalEdit input[name="referencia"]').value = product.referencia;
    document.querySelector('#modalEdit input[name="nombre"]').value = product.nombre;
    document.querySelector('#modalEdit textarea[name="descripcion"]').value = product.descripcion || '';
    document.querySelector('#modalEdit input[name="precio"]').value = product.precio;
    
    // Seleccionar categoría
    const categorySelect = document.querySelector('#modalEdit select[name="categoria"]');
    categorySelect.value = product.categoria;
    
    // Llenar tallas
    if (product.tallas) {
      document.querySelector('#modalEdit input[name="tallas.S"]').value = product.tallas.S || 0;
      document.querySelector('#modalEdit input[name="tallas.M"]').value = product.tallas.M || 0;
      document.querySelector('#modalEdit input[name="tallas.L"]').value = product.tallas.L || 0;
      document.querySelector('#modalEdit input[name="tallas.XL"]').value = product.tallas.XL || 0;
      document.querySelector('#modalEdit input[name="tallas.U"]').value = product.tallas.U || 0;
    }
    
    // Generar formularios de colores
    const colorContainer = document.getElementById('editColorContainer');
    product.colores?.forEach((color, index) => {
      colorContainer.appendChild(generateColorForm(index, color));
    });
    
    // Generar formularios de estampados
    const printsContainer = document.getElementById('editPrintsContainer');
    product.estampados?.forEach((estampado, index) => {
      printsContainer.appendChild(generateEstampadoForm(index, estampado));
    });
    
    // Mostrar modal
    const editModal = new bootstrap.Modal(document.getElementById('modalEdit'));
    editModal.show();
  })
  .catch(error => console.error('Error:', error));
}

document.getElementById('submitEditForm').addEventListener('click', function() {
  const form = document.getElementById('editProductForm');
  const formData = new FormData(form);
  const productId = document.getElementById('editProductId').value;

  console.log(productId);
  
  fetch(`/admin/products/update/${productId}`, {
    method: 'PUT',
    body: formData,
    credentials: 'include'
  })
  .then(response => response.json())
  .then(result => {
    if (result.error) {
      throw new Error(result.message);
    }
    
    // Cerrar el modal
    const editModal = bootstrap.Modal.getInstance(document.getElementById('modalEdit'));
    editModal.hide();
    // Recargar los productos
    loadProducts(); // Suponiendo que tienes esta función
  })
  .catch(error => {
    console.error('Error:', error);
    mostrarAlerta('Error al actualizar: ' + error.message);
  });
});


// Función para generar formulario de color
function generateColorForm(index, colorData) {
  const formDiv = document.createElement('div');
  formDiv.className = 'position-relative border p-2 pt-4 rounded bg-light mt-2';
  formDiv.dataset.index = index;
  formDiv.innerHTML = `
    <input type="hidden" class="replace-images" name="replaceImages[${index}]" value="false">
    <button type="button" class="btn-close position-absolute top-0 end-0 m-2" onclick="this.parentElement.remove()"></button>
    <div>
      <label class="form-label">Código de color</label>
      <input type="text" class="form-control" name="colores[${index}].codigo" value="${colorData.codigo}" required>
    </div>
    <div class="mt-2">
      <label class="form-label">Nombre de la imagen de referencia</label>
      <input type="text" class="form-control" name="colores[${index}].imagenRef" value="${colorData.imagenRef}" required>
    </div>
    <div class="mt-2">
      <label class="form-label">Imagen de referencia </label>
      <input type="file" class="form-control ref-image" name="colores[${index}].imagenRef" accept="image/*">
      <small class="text-muted">Esta es la imagen principal que representa el color</small>
    </div>
    <div class="mt-2">
      <label class="form-label">Imágenes adicionales</label>
      <div class="row g-2">
        ${Array.from({length: 4}, (_, i) => `
          <div class="col-md-4">
            <input type="file" class="form-control" name="colores[${index}]" accept="image/*">
          </div>
        `).join('')}
      </div>
    </div>
    ${colorData.imagenes && colorData.imagenes.length > 0 ? `
    <div class="mt-3">
      <label class="form-label">Imágenes existentes:</label>
      <div class="d-flex flex-wrap gap-2">
        ${colorData.imagenes.map(img => `
          <div class="position-relative">
            <img src="${img.publicUrl}" alt="Imagen" width="80" height="80" class="img-thumbnail">
            <span class="position-absolute top-0 start-100 translate-middle badge bg-info">${img.orden}</span>
          </div>
        `).join('')}
      </div>
    </div>
    ` : ''}
  `;
  return formDiv;
}

// Función para generar formulario de estampados 
function generateEstampadoForm(index, colorData) {
  const formDiv = document.createElement('div');
  formDiv.className = 'position-relative border p-2 pt-4 rounded bg-light mt-2';
  formDiv.dataset.index = index;
  formDiv.innerHTML = `
    <input type="hidden" class="replace-images-estampado" name="replaceImagesEstampado[${index}]" value="false">
    <button type="button" class="btn-close position-absolute top-0 end-0 m-2" onclick="this.parentElement.remove()"></button>
    <div>
      <label class="form-label">Código de color</label>
      <input type="text" class="form-control" name="estampados[${index}].codigo" value="${colorData.codigo}" required>
    </div>
    <div class="mt-2">
      <label class="form-label">Nombre de la imagen de referencia</label>
      <input type="text" class="form-control" name="estampados[${index}].imagenRef" value="${colorData.imagenRef}" required>
    </div>
    <div class="mt-2">
      <label class="form-label">Imagen de referencia </label>
      <input type="file" class="form-control ref-image" name="estampados[${index}].imagenRef" accept="image/*">
      <small class="text-muted">Esta es la imagen principal que representa el color</small>
    </div>
    <div class="mt-2">
      <label class="form-label">Imágenes adicionales</label>
      <div class="row g-2">
        ${Array.from({length: 4}, (_, i) => `
          <div class="col-md-4">
            <input type="file" class="form-control" name="estampados[${index}]" accept="image/*">
          </div>
        `).join('')}
      </div>
    </div>
    ${colorData.imagenes && colorData.imagenes.length > 0 ? `
    <div class="mt-3">
      <label class="form-label">Imágenes existentes:</label>
      <div class="d-flex flex-wrap gap-2">
        ${colorData.imagenes.map(img => `
          <div class="position-relative">
            <img src="${img.publicUrl}" alt="Imagen" width="80" height="80" class="img-thumbnail">
            <span class="position-absolute top-0 start-100 translate-middle badge bg-info">${img.orden}</span>
          </div>
        `).join('')}
      </div>
    </div>
    ` : ''}
  `;
  return formDiv;
}

// Evento para el botón de editar
document.getElementById('submitEditForm').addEventListener('click', function() {
  const form = document.getElementById('editProductForm');
  const formData = new FormData(form);
  const productId = document.getElementById('editProductId').value;

  // Agregar los indicadores de reemplazo al FormData
  document.querySelectorAll('.replace-images').forEach(input => {
    if (input.value === "true") {
      const index = input.name.match(/\[(\d+)\]/)[1];
      formData.append(`replaceImages[${index}]`, "true");
    }
  });
  
  document.querySelectorAll('.replace-images-estampado').forEach(input => {
    if (input.value === "true") {
      const index = input.name.match(/\[(\d+)\]/)[1];
      formData.append(`replaceImagesEstampado[${index}]`, "true");
    }
  });
  
  fetch(`/admin/products/update/${productId}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
    body: formData
  })
  .then(response => response.json())
  .then(result => {
    if (result.error) {
      throw new Error(result.message);
    }
    
    // Cerrar el modal
    const editModal = bootstrap.Modal.getInstance(document.getElementById('modalEdit'));
    editModal.hide();
    // Recargar los productos
    loadProducts(); 
      // Mostrar mostrarAlertaa de éxito
    mostrarAlerta("Producto editado correctamente.");
  })
  .catch(error => {
    console.error('Error:', error);
    mostrarAlerta('Error al actualizar: ' + error.message);
  });
});

// Botones para agregar nuevos colores/estampados en el modal
document.getElementById('addEditColorBtn').addEventListener('click', function() {
  const container = document.getElementById('editColorContainer');
  const index = container.children.length;
  container.appendChild(generateColorForm(index, {codigo: '', imagenRef: '', imagenes: []}));
});

document.getElementById('addEditEstampadoBtn').addEventListener('click', function() {
  const container = document.getElementById('editPrintsContainer');
  const index = container.children.length;
  container.appendChild(generateEstampadoForm(index, {codigo: '', imagenRef: '', imagenes: []}));
});

function setupImageReplacementListeners() {
  // Para imagenRef de colores
  document.querySelectorAll('#editColorContainer .ref-image').forEach(input => {
    input.addEventListener('change', function() {
      const formDiv = this.closest('.color-form');
      const replaceInput = formDiv.querySelector('.replace-images');
      replaceInput.value = "true";
      
      // Destacar que es imagenRef
      this.parentElement.classList.add('border', 'border-danger', 'p-2');
    });
  });
  
  // Para imágenes adicionales de colores
  document.querySelectorAll('#editColorContainer .additional-image').forEach(input => {
    input.addEventListener('change', function() {
      const formDiv = this.closest('.color-form');
      const replaceInput = formDiv.querySelector('.replace-images');
      replaceInput.value = "true";
    });
  });
  
  // Repetir para estampados
  document.querySelectorAll('#editPrintsContainer .ref-image').forEach(input => {
    input.addEventListener('change', function() {
      const formDiv = this.closest('.stamp-form');
      const replaceInput = formDiv.querySelector('.replace-images-estampado');
      replaceInput.value = "true";
      this.parentElement.classList.add('border', 'border-danger', 'p-2');
    });
  });
  
  document.querySelectorAll('#editPrintsContainer .additional-image').forEach(input => {
    input.addEventListener('change', function() {
      const formDiv = this.closest('.stamp-form');
      const replaceInput = formDiv.querySelector('.replace-images-estampado');
      replaceInput.value = "true";
    });
  });
}

function mostrarSiTieneValor(valor, talla) {
  if (valor && valor > 0) {
    return `<div class="talla-item">${talla}</div>`;
  }
  return '';
}

// const botonColor = document.getElementById("addColorBtn");
// botonColor.addEventListener('click', () => {
//   console.log("Agregando Color");
//   const accion = botonColor.dataset.action;
//   agregarColor(accion);
// });

// const botonEstampado = document.getElementById("addEstampadoBtn");
// botonEstampado.addEventListener('click', () => {
//   console.log("Agregando Estampado");
//   const accion = botonEstampado.dataset.action;
//   agregarColor(accion);
// });

// let colorId = 0;
// let estamapadoId = 0;

function colorTemplate(index) {
  const div = document.createElement('div');
  div.className = 'position-relative border p-2 pt-4 rounded bg-light mt-2';
  div.innerHTML = `
  <div class="position-relative border p-2 pt-4 rounded bg-light divItemsAdd">

    <button type="button" class="btn-close position-absolute top-0 end-0 m-2" 
    data-index="${index}" aria-label="Cerrar"></button>
  
    <div>
      <label class="form-label">Código de color</label>
      <input type="text" class="form-control color color-codigo" name="codigoColor">
    </div>

    <div>
      <label class="form-label">Nombre de la imagen de referencia</label>
      <input type="text" class="form-control color color-nombre-ref" name="nombreRef">
    </div>

    <div>
      <label class="form-label">Imagen de referencia</label>
      <div class="col"><input name="colorRef" class="form-control" type="file" accept="image/*"></div>
    </div>

    <div class="col-md-12">
      <label class="form-label">Imágenes</label>
      <div class="row g-3">
        <div class="col-md-6"><input name="colores" class="form-control" type="file" accept="image/*"></div>
        <div class="col-md-6"><input name="colores" class="form-control" type="file" accept="image/*"></div>
        <div class="col-md-6"><input name="colores" class="form-control" type="file" accept="image/*"></div>
        <div class="col-md-6"><input name="colores" class="form-control" type="file" accept="image/*"></div>
      </div>
    </div>

  </div>
  `;
  return div;
}

function estampadoTemplate(index) {
  const div = document.createElement('div');
  div.className = 'position-relative border p-2 pt-4 rounded bg-light mt-2';
  div.innerHTML = `
  <div class="position-relative border p-2 pt-4 rounded bg-light divItemsAdd" >

      <button type="button" class="btn-close position-absolute top-0 end-0 m-2" 
      data-index="${index}" aria-label="Cerrar"></button>
  
    <div>
      <label class="form-label">Código del estampado</label>
      <input type="text" class="form-control color estampado-codigo" name="codigoEstampado">
    </div>

    <div>
      <label class="form-label">Nombre de la imagen de referencia</label>
      <input type="text" class="form-control color estampado-nombre-ref" name="nombreRef">
    </div>

    <div>
      <label class="form-label">Imagen de referencia</label>
      <div class="col"><input name="estampadoRef" class="form-control" type="file" accept="image/*"></div>
    </div>

    <div class="col-md-12">
      <label class="form-label">Imágenes</label>
      <div class="row g-3">
        <div class="col-md-6"><input name="estampados" class="form-control" type="file" accept="image/*"></div>
        <div class="col-md-6"><input name="estampados" class="form-control" type="file" accept="image/*"></div>
        <div class="col-md-6"><input name="estampados" class="form-control" type="file" accept="image/*"></div>
        <div class="col-md-6"><input name="estampados" class="form-control" type="file" accept="image/*"></div>
      </div>
    </div>

  </div>
  `;
  return div;
}

function recolectarDatosGrupo(containerSelector, fieldSelectors) {
  const container = document.querySelector(containerSelector);
  const items = container.querySelectorAll(".divItemsAdd");
  const resultado = [];

  items.forEach(item => {
    const datos = {};

    // Campo de texto: código
    if (fieldSelectors.codigo) {
      const codigoInput = item.querySelector(fieldSelectors.codigo);
      datos.codigo = codigoInput?.value.trim() || "";
    }

    // Campo de texto: nombre de la imagen de referencia
    if (fieldSelectors.nombreRef || fieldSelectors.imagenRef) {
      const refInput = item.querySelector(fieldSelectors.nombreRef || fieldSelectors.imagenRef);
      datos.nombreRef = refInput?.value.trim() || "";
      datos.imagenRef = refInput?.value.trim() || ""; // alias si se llama distinto
    }

    // Imagen de referencia
    if (fieldSelectors.imagenRefFile) {
      const imagenRefInput = item.querySelector(fieldSelectors.imagenRefFile);
      datos.imagen = imagenRefInput?.files?.[0] || null;
    }

    // Imágenes adicionales
    if (fieldSelectors.imagenes) {
      const imagenInputs = item.querySelectorAll(fieldSelectors.imagenes);
      datos.imagenes = [];
      imagenInputs.forEach(input => {
        if (input.files.length > 0) {
          datos.imagenes.push(...input.files);
        }
      });
    }

    resultado.push(datos);
  });

  console.log("Resultado: ", resultado);
  return resultado;
}

document.addEventListener('DOMContentLoaded', function() {
  setupImageReplacementListeners();
  
  // Configurar botones para agregar nuevos colores/estampados
  document.getElementById('addEditColorBtn').addEventListener('click', function() {
    const container = document.getElementById('editColorContainer');
    const index = container.children.length;
    container.appendChild(generateColorForm(index, {codigo: '', imagenRef: '', imagenes: []}));
    setupImageReplacementListeners(); // Re-configurar listeners
  });
  
  document.getElementById('addEditEstampadoBtn').addEventListener('click', function() {
    const container = document.getElementById('editPrintsContainer');
    const index = container.children.length;
    container.appendChild(generateEstampadoForm(index, {codigo: '', imagenRef: '', imagenes: []}));
    setupImageReplacementListeners(); // Re-configurar listeners
  });
});

// Inicialización de los modales
document.addEventListener('DOMContentLoaded', function() {
  // Modal de productos - Colores
  document.getElementById('addColorBtn').addEventListener('click', function() {
    agregarItem('colorContainer', colorTemplate);
  });
  
  // Modal de productos - Estampados
  document.getElementById('addEstampadoBtn').addEventListener('click', function() {
    agregarItem('printsContainer', estampadoTemplate);
  });
  
  // Modal de carrusel
  document.getElementById('addCarruselItemBtn').addEventListener('click', function() {
    agregarItem('formContainer', carruselItemTemplate);
  });
  
  // Inicializar items existentes
  inicializarItemsExistentes('colorContainer');
  inicializarItemsExistentes('printsContainer');
  inicializarItemsExistentes('formContainer');
});

// Función para inicializar items preexistentes
function inicializarItemsExistentes(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  
  const items = container.children;
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    
    // Actualizar índices
    const inputs = item.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
      let name = input.getAttribute('name');
      if (name) {
        name = name.replace(/\[\d+\]/g, `[${i}]`);
        input.setAttribute('name', name);
      }
    });
    
    // Configurar botón de eliminar
    const deleteBtn = item.querySelector('.btn-close');
    if (deleteBtn) {
      deleteBtn.setAttribute('data-index', i);
      deleteBtn.addEventListener('click', function() {
        eliminarItem(containerId, i);
      });
    }
  }
}

// Función para reorganizar elementos en un contenedor
function reorganizarItems(containerId) {
  console.groupCollapsed(`[reorganizarItems] Inicio - Contenedor: ${containerId}`);
  
  const container = document.getElementById(containerId);
  if (!container) {
    console.error(`❌ Contenedor no encontrado: ${containerId}`);
    console.groupEnd();
    return;
  }
  
  const items = Array.from(container.children);
  console.log(`ℹ️ Total de items antes de reorganizar: ${items.length}`);
  
  // Limpiar el contenedor
  container.innerHTML = '';
  console.log('🧹 Contenedor vaciado');
  
  items.forEach((item, newIndex) => {
    console.groupCollapsed(`🔄 Procesando item (índice antiguo: ${item.dataset.index || '?'}, nuevo índice: ${newIndex})`);
    
    // Actualizar índices internos
    const inputs = item.querySelectorAll('input, select, textarea');
    console.log(`ℹ️ Campos encontrados: ${inputs.length}`);
    
    inputs.forEach(input => {
      const oldName = input.getAttribute('name');
      if (oldName) {
        const newName = oldName.replace(/\[\d+\]/g, `[${newIndex}]`);
        input.setAttribute('name', newName);
        console.log(`✏️ Actualizado campo: ${oldName} => ${newName}`);
      }
    });
    
    // Actualizar botones de eliminar
    const deleteBtn = item.querySelector('.btn-close');
    if (deleteBtn) {
      const oldIndex = deleteBtn.getAttribute('data-index');
      deleteBtn.setAttribute('data-index', newIndex);
      
      // Guardar el índice antiguo para depuración
      item.dataset.oldIndex = oldIndex;
      
      console.log(`✏️ Botón eliminar actualizado: data-index ${oldIndex} => ${newIndex}`);
      
      // Reasignar evento con el nuevo índice
      deleteBtn.onclick = null;
      deleteBtn.addEventListener('click', function() {
        console.log(`🖱️ Botón eliminar clickeado (nuevo índice: ${newIndex})`);
        eliminarItem(containerId, newIndex);
      });
    }
    
    // Agregar el item reorganizado
    container.appendChild(item);
    console.log(`📥 Item agregado en nueva posición ${newIndex}`);
    console.groupEnd();
  });
  
  console.log(`✅ Reorganización completada. Items reorganizados: ${container.children.length}`);
  console.groupEnd();
}

// Función para eliminar un item con reorganización
function eliminarItem(containerId, index) {
  console.groupCollapsed(`[eliminarItem] Inicio - Contenedor: ${containerId}, Índice: ${index}`);
  
  const container = document.getElementById(containerId);
  if (!container) {
    console.error(`❌ Contenedor no encontrado: ${containerId}`);
    console.groupEnd();
    return;
  }
  
  const items = container.children;
  console.log(`ℹ️ Items encontrados: ${items.length}`);
  
  if (items[index]) {
    console.log(`🗑️ Eliminando item en índice ${index}:`, items[index]);
    
    // Mostrar información detallada del item que se eliminará
    console.groupCollapsed(`🔍 Detalles del item a eliminar`);
    console.log('Elemento:', items[index]);
    console.log('Contenido:', items[index].innerHTML);
    console.log('Inputs:', items[index].querySelectorAll('input, select, textarea'));
    console.groupEnd();
    
    container.removeChild(items[index]);
    console.log(`✅ Item eliminado. Items restantes: ${container.children.length}`);
    
    console.groupCollapsed(`🔄 Llamando a reorganizarItems(${containerId})`);
    reorganizarItems(containerId);
    console.groupEnd();
  } else {
    console.error(`❌ Índice inválido: ${index}. No existe item en esa posición.`);
    console.log('Items disponibles:', Array.from(items).map((_, i) => i));
  }
  
  console.log(`🏁 Fin de eliminarItem - Items restantes: ${container.children.length}`);
  console.groupEnd();
}


// Función para agregar nuevos items
function agregarItem(containerId, templateFunction) {
  const container = document.getElementById(containerId);
  const index = container.children.length;
  
  // Crear nuevo item
  const newItem = templateFunction(index);
  container.appendChild(newItem);

  console.log("crear: " + containerId + "index: " + index);
  
  // Asignar evento de eliminación
  const deleteBtn = newItem.querySelector('.btn-close');
  if (deleteBtn) {
    deleteBtn.addEventListener('click', function() {
      eliminarItem(containerId, index);
    });
  }
}


function mostrarAlerta(mensaje, tiempo = 3000) {
  const modal = document.getElementById("alertModal");
  const mensajeElem = document.getElementById("alertMessage");
  mensajeElem.textContent = mensaje;
  modal.style.display = "flex";

  // Cierra automáticamente si se especifica tiempo
  if (tiempo > 0) {
    setTimeout(() => {
      cerrarAlerta();
    }, tiempo);
  }
}

function cerrarAlerta() {
  const modal = document.getElementById("alertModal");
  modal.style.display = "none";
}
