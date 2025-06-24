// comprarProducto.js - Versión corregida
// Debe cargarse con: <script type="module" src="./comprarProducto.js"></script>

// === VARIABLES GLOBALES ===
let currentImageIndex = 0;
let productImages = [];
let colorSeleccionado = null;
let estampadoSeleccionado = null;
let count = 0;

// === OBTENER REFERENCIAS A ELEMENTOS ===
function getElements() {
  return {
    descripcionModal: document.getElementById('descripcionProducto'),
    btnClose: document.getElementById('btnClose'),
    btnCancelar: document.getElementById('btnCancelar'),
    btnCerrarCompra: document.getElementById('btnCerrarCompra'),
    modalProducto: document.getElementById('modalProducto'),
    prevArrow: document.querySelector('.prev-arrow'),
    nextArrow: document.querySelector('.next-arrow')
  };
}

// === INICIALIZAR EVENTOS ===
document.addEventListener('DOMContentLoaded', () => {
  const elements = getElements();
  
  // Eventos para cerrar modales
  if (elements.btnClose) {
    elements.btnClose.onclick = () => {
      if (elements.descripcionModal) {
        elements.descripcionModal.style.display = "none";
      }
    };
  }
  
  if (elements.btnCancelar) {
    elements.btnCancelar.onclick = () => {
      if (elements.descripcionModal) {
        elements.descripcionModal.style.display = "none";
      }
    };
  }
  
  if (elements.btnCerrarCompra) {
    elements.btnCerrarCompra.onclick = () => {
      if (elements.modalProducto) {
        elements.modalProducto.style.display = "none";
      }
    };
  }

  // Eventos para navegación de imágenes
  if (elements.prevArrow) {
    elements.prevArrow.addEventListener('click', () => {
      if (productImages.length <= 1) return;
      currentImageIndex = (currentImageIndex - 1 + productImages.length) % productImages.length;
      updateMainImageAndThumbnails();
    });
  }
  
  if (elements.nextArrow) {
    elements.nextArrow.addEventListener('click', () => {
      if (productImages.length <= 1) return;
      currentImageIndex = (currentImageIndex + 1) % productImages.length;
      updateMainImageAndThumbnails();
    });
  }

  // Evento para seguir comprando
  const btnSeguirComprando = document.querySelector(".btnSeguirComprando");
  if (btnSeguirComprando) {
    btnSeguirComprando.addEventListener("click", () => {
      const tallaSeleccionada = document.querySelector(".talla-btn.selected");
      if (tallaSeleccionada) {
        tallaSeleccionada.classList.remove("selected");
      }

      const cantidadElement = document.getElementById("cantidad");
      if (cantidadElement) {
        cantidadElement.textContent = "0";
      }
      count = 0;
    });
  }
});

// === EVENTOS GLOBALES ===
window.onclick = (event) => {
  const elements = getElements();
  if (event.target === elements.descripcionModal) {
    elements.descripcionModal.style.display = "none";
  }
  if (event.target === elements.modalProducto) {
    elements.modalProducto.style.display = "none";
  }
};

// === FUNCIÓN DESCRIPCIÓN PRODUCTO ===
export function AbrirDescripcionProducto(referenciaProducto) {
  const producto = window.productosCargados?.find(p => p.referencia === referenciaProducto);
  if (!producto) {
    alert("Producto no encontrado");
    return;
  }

  const nombreElement = document.getElementById("nombreProducto");
  const descripcionElement = document.getElementById("descripcionProductoTexto");
  const modal = document.getElementById('descripcionProducto');
  
  if (nombreElement) {
    nombreElement.textContent = producto.nombre || 'Sin nombre';
  }
  
  if (descripcionElement) {
    descripcionElement.textContent = producto.descripcion || "Sin descripción disponible.";
  }
  
  if (modal) {
    modal.style.display = "flex";
  }
}

// === FUNCIÓN PARA CARGAR IMÁGENES SEGÚN SELECCIÓN ===
function cargarImagenesSegunSeleccion(producto) {
  if (colorSeleccionado?.imagenes?.length > 1) {
    productImages = colorSeleccionado.imagenes.slice(1);
  } else if (colorSeleccionado?.imagenes?.length === 1) {
    productImages = colorSeleccionado.imagenes;
  } else if (estampadoSeleccionado?.imagenes?.length > 1) {
    productImages = estampadoSeleccionado.imagenes.slice(1);
  } else if (estampadoSeleccionado?.imagenes?.length === 1) {
    productImages = estampadoSeleccionado.imagenes;
  } else {
    productImages = (producto.imagenes || []).slice(1);
    if (productImages.length === 0 && producto.imagenes?.length > 0) {
      productImages = producto.imagenes;
    }
  }

  currentImageIndex = 0;
  updateMainImageAndThumbnails();
}

// === ACTUALIZAR MINIATURAS E IMAGEN PRINCIPAL ===
function updateMainImageAndThumbnails() {
  const imagenPrincipal = document.getElementById("modal-imagen");
  const galeria = document.querySelector(".thumbnail-gallery");

  if (!productImages || productImages.length === 0) return;

  imagenPrincipal.src = productImages[currentImageIndex].publicUrl;
  galeria.innerHTML = "";

  productImages.forEach((imgObj, idx) => {
    const thumb = document.createElement("img");
    thumb.src = imgObj.publicUrl;
    thumb.classList.add("thumbnail-img");

    if (currentImageIndex === idx) {
      thumb.classList.add("selected");
    }

    thumb.addEventListener("click", () => {
      currentImageIndex = idx;
      imagenPrincipal.src = productImages[currentImageIndex].publicUrl;
      updateMainImageAndThumbnails();
    });

    galeria.appendChild(thumb);
  });
}

// === FUNCIÓN PRINCIPAL: ABRIR MODAL DE COMPRA ===
export function AbrirProductoComprar(referenciaProducto) {
 const producto = productosCargados?.find(p => p.referencia === referenciaProducto);
  if (!producto) {
    alert("Producto no encontrado");
    return;
  }

  // Reset selecciones
  colorSeleccionado = null;
  estampadoSeleccionado = null;

  // Elementos del modal
  const modalNombre = document.getElementById("modal-nombre");
  const modalReferencia = document.getElementById("modal-referencia");
  const modalPrecio = document.getElementById("modal-precio");
  const modalProducto = document.getElementById('modalProducto');

  if (modalNombre) {
    modalNombre.textContent = producto.nombre || 'Sin nombre';
  }
  
  if (modalReferencia) {
    modalReferencia.textContent = producto.referencia || 'Sin referencia';
  }
  
  if (modalPrecio) {
    modalPrecio.textContent = `$${(producto.precio || 0).toLocaleString('es-CO')}`;
  }

  // === ESTAMPADOS ===
  const contenedorEstampados = document.getElementById("modal-estampados");
  if (contenedorEstampados) {
    contenedorEstampados.innerHTML = "";
    (producto.estampados || []).forEach((est, index) => {
      const img = document.createElement("img");
      img.src = est.publicUrl || '';
      img.alt = est.codigo || `Estampado ${index + 1}`;
      img.title = est.codigo || `Estampado ${index + 1}`;
      img.classList.add("estampado-img", "estampado-option");
      
      img.addEventListener("click", () => {
        document.querySelectorAll(".color-option").forEach(o => o.classList.remove("selected"));
        document.querySelectorAll(".estampado-option").forEach(o => o.classList.remove("selected"));
        img.classList.add("selected");
        estampadoSeleccionado = est;
        colorSeleccionado = null;
        cargarImagenesSegunSeleccion(producto);
      });
      
      img.onerror = function() {
        this.style.display = 'none';
      };
      
      contenedorEstampados.appendChild(img);
      
      if (index === 0 && (!producto.colores || producto.colores.length === 0)) {
        img.classList.add("selected");
        estampadoSeleccionado = est;
      }
    });
  }

  // === COLORES ===
  const contenedorColores = document.getElementById("modal-colores");
  if (contenedorColores) {
    contenedorColores.innerHTML = "";
    (producto.colores || []).forEach((color, index) => {
      const img = document.createElement("img");
      img.src = color.publicUrl || '';
      img.alt = color.codigo || `Color ${index + 1}`;
      img.title = color.codigo || `Color ${index + 1}`;
      img.classList.add("color-img", "color-option");
      
      img.addEventListener("click", () => {
        document.querySelectorAll(".color-option").forEach(o => o.classList.remove("selected"));
        document.querySelectorAll(".estampado-option").forEach(o => o.classList.remove("selected"));
        img.classList.add("selected");
        colorSeleccionado = color;
        estampadoSeleccionado = null;
        cargarImagenesSegunSeleccion(producto);
      });
      
      img.onerror = function() {
        this.style.display = 'none';
      };
      
      contenedorColores.appendChild(img);
      
      if (index === 0) {
        img.classList.add("selected");
        colorSeleccionado = color;
      }
    });
  }

  // Cargar imágenes iniciales
  cargarImagenesSegunSeleccion(producto);

  // === TALLAS ===
  const contenedorTallas = document.getElementById("modal-tallas");
  if (contenedorTallas) {
    contenedorTallas.innerHTML = "";
    const tallasDisponibles = Object.entries(producto.tallas || {})
      .filter(([_, cantidad]) => cantidad > 0)
      .map(([talla]) => talla);

    if (tallasDisponibles.length > 0) {
      tallasDisponibles.forEach(talla => {
        const btn = document.createElement("button");
        btn.textContent = talla;
        btn.classList.add("talla-btn");
        btn.addEventListener("click", () => {
          document.querySelectorAll(".talla-btn").forEach(b => b.classList.remove("selected"));
          btn.classList.add("selected");
        });
        contenedorTallas.appendChild(btn);
      });
    } else {
      contenedorTallas.textContent = "No disponibles";
    }
  }

  // === CANTIDAD ===
  const increment = document.getElementById("increment");
  const decrement = document.getElementById("decrement");
  const cantidad = document.getElementById("cantidad");
  count = 0;

  if (increment) {
    increment.onclick = () => {
      count++;
      if (cantidad) {
        cantidad.textContent = count;
      }
    };
  }
  
  if (decrement) {
    decrement.onclick = () => {
      if (count > 0) {
        count--;
        if (cantidad) {
          cantidad.textContent = count;
        }
      }
    };
  }
  
  if (cantidad) {
    cantidad.textContent = count;
  }

  // === DESCRIPCIÓN ===
  const btnOpenDescripcion = document.getElementById('btnOpenDescripcion');
  if (btnOpenDescripcion) {
    btnOpenDescripcion.setAttribute('data-ref', producto.referencia);
    btnOpenDescripcion.onclick = () => {
      AbrirDescripcionProducto(producto.referencia);
    };
  }

  // Mostrar modal
  if (modalProducto) {
    modalProducto.style.display = "block";
  }
}

// === ABRIR DESDE CARRUSEL ===
export function AbrirProductoComprarDesdeCarrusel(producto) {
  if (!producto || !producto.referencia) {
    alert("Producto inválido");
    return;
  }

  // Asegurar que el producto esté disponible globalmente
  if (!window.productosCargados) {
    window.productosCargados = [];
  }
  const yaExiste = window.productosCargados.some(p => p.referencia === producto.referencia);
  if (!yaExiste) {
    window.productosCargados.push(producto);
  }

  AbrirProductoComprar(producto.referencia);
}

// === EXPONER FUNCIONES AL NAVEGADOR (HTML onclick) ===
window.AbrirProductoComprar = AbrirProductoComprar;
window.AbrirProductoComprarDesdeCarrusel = AbrirProductoComprarDesdeCarrusel;
window.AbrirDescripcionProducto = AbrirDescripcionProducto;