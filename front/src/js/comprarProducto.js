// comprarProducto.js – Versión adaptada a delegación DOMContentLoaded
// Cárguese con: <script type="module" src="./comprarProducto.js"></script>

/* ============================ VARIABLES GLOBALES ============================ */
let currentImageIndex = 0;
let productImages = [];
let colorSeleccionado = null;
let estampadoSeleccionado = null;
let count = 0;

/* ======================== UTILIDADES Y REFERENCIAS DOM ====================== */
function getElements() {
  return {
    descripcionModal: document.getElementById("descripcionProducto"),
    btnClose: document.getElementById("btnClose"),
    btnCancelar: document.getElementById("btnCancelar"),
    btnCerrarCompra: document.getElementById("btnCerrarCompra"),
    modalProducto: document.getElementById("modalProducto"),
    prevArrow: document.querySelector(".prev-arrow"),
    nextArrow: document.querySelector(".next-arrow"),
  };
}

/* =========================== LISTENERS INICIALES ============================ */
document.addEventListener("DOMContentLoaded", () => {
  const elements = getElements();

  /* —— Cierre de modales —— */
  elements.btnClose?.addEventListener("click", () => {
    elements.descripcionModal.style.display = "none";
  });

  elements.btnCancelar?.addEventListener("click", () => {
    elements.descripcionModal.style.display = "none";
  });

  elements.btnCerrarCompra?.addEventListener("click", () => {
    elements.modalProducto.style.display = "none";
  });

  /* —— Navegación de imágenes —— */
  elements.prevArrow?.addEventListener("click", () => {
    if (productImages.length <= 1) return;
    currentImageIndex = (currentImageIndex - 1 + productImages.length) % productImages.length;
    updateMainImageAndThumbnails();
  });

  elements.nextArrow?.addEventListener("click", () => {
    if (productImages.length <= 1) return;
    currentImageIndex = (currentImageIndex + 1) % productImages.length;
    updateMainImageAndThumbnails();
  });

  /* —— Seguir comprando —— */
  document.querySelector(".btnSeguirComprando")?.addEventListener("click", () => {
    document.querySelector(".talla-btn.selected")?.classList.remove("selected");
    const cantidadElement = document.getElementById("cantidad");
    if (cantidadElement) cantidadElement.textContent = "0";
    count = 0;
  });

  /* —— Delegación para botones quick‑buy (dinámicos) —— */
  document.body.addEventListener("click", (evt) => {
    const btn = evt.target.closest(".quick-buy");
    if (!btn) return; // Click en otro elemento

    const productoData = btn.getAttribute("data-producto");
    if (!productoData) return;

    try {
      const producto = JSON.parse(productoData);
      AbrirProductoComprarDesdeCarrusel(producto);
    } catch (error) {
      console.error("Error al parsear el producto en quick-buy:", error);
    }
  });
});

/* ============================ EVENTOS DE WINDOW ============================= */
window.onclick = (event) => {
  const { descripcionModal, modalProducto } = getElements();
  if (event.target === descripcionModal) descripcionModal.style.display = "none";
  if (event.target === modalProducto) modalProducto.style.display = "none";
};

/* ======================= DESCRIPCIÓN DEL PRODUCTO =========================== */
export function AbrirDescripcionProducto(referenciaProducto) {
  const producto = window.productosCargados?.find((p) => p.referencia === referenciaProducto);
  if (!producto) return alert("Producto no encontrado");

  const nombreElement = document.getElementById("nombreProducto");
  const descripcionElement = document.getElementById("descripcionProductoTexto");
  const modal = document.getElementById("descripcionProducto");

  if (nombreElement) nombreElement.textContent = producto.nombre || "Sin nombre";
  if (descripcionElement) descripcionElement.textContent = producto.descripcion || "Sin descripción disponible.";
  if (modal) modal.style.display = "flex";
}

/* ============== CARGAR Y ACTUALIZAR IMÁGENES SEGÚN SELECCIÓN =============== */
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
    if (productImages.length === 0 && producto.imagenes?.length) {
      productImages = producto.imagenes;
    }
  }

  currentImageIndex = 0;
  updateMainImageAndThumbnails();
}

function updateMainImageAndThumbnails() {
  const imagenPrincipal = document.getElementById("modal-imagen");
  const galeria = document.querySelector(".thumbnail-gallery");
  if (!imagenPrincipal || !galeria || productImages.length === 0) return;

  imagenPrincipal.src = productImages[currentImageIndex].publicUrl;
  galeria.innerHTML = "";

  productImages.forEach((imgObj, idx) => {
    const thumb = document.createElement("img");
    thumb.src = imgObj.publicUrl;
    thumb.classList.add("thumbnail-img");
    if (idx === currentImageIndex) thumb.classList.add("selected");

    thumb.addEventListener("click", () => {
      currentImageIndex = idx;
      imagenPrincipal.src = productImages[currentImageIndex].publicUrl;
      updateMainImageAndThumbnails();
    });

    galeria.appendChild(thumb);
  });
}

/* =================== ABRIR MODAL PRINCIPAL DE COMPRA ======================= */
export function AbrirProductoComprar(referenciaProducto) {
  const producto = window.productosCargados?.find((p) => p.referencia === referenciaProducto);
  if (!producto) return alert("Producto no encontrado");

  colorSeleccionado = null;
  estampadoSeleccionado = null;

  const modalNombre = document.getElementById("modal-nombre");
  const modalReferencia = document.getElementById("modal-referencia");
  const modalPrecio = document.getElementById("modal-precio");
  const modalProducto = document.getElementById("modalProducto");

  if (modalNombre) modalNombre.textContent = producto.nombre || "Sin nombre";
  if (modalReferencia) modalReferencia.textContent = producto.referencia || "Sin referencia";
  if (modalPrecio) modalPrecio.textContent = `$${(producto.precio || 0).toLocaleString("es-CO")}`;

  /* —— Estampados —— */
  const contenedorEstampados = document.getElementById("modal-estampados");
  if (contenedorEstampados) {
    contenedorEstampados.innerHTML = "";
    (producto.estampados || []).forEach((est, index) => {
      const img = document.createElement("img");
      img.src = est.publicUrl || "";
      img.alt = est.codigo || `Estampado ${index + 1}`;
      img.title = est.codigo || `Estampado ${index + 1}`;
      img.classList.add("estampado-img", "estampado-option");

      img.addEventListener("click", () => {
        document.querySelectorAll(".color-option, .estampado-option").forEach((o) => o.classList.remove("selected"));
        img.classList.add("selected");
        estampadoSeleccionado = est;
        colorSeleccionado = null;
        cargarImagenesSegunSeleccion(producto);
      });

      img.onerror = () => (img.style.display = "none");
      contenedorEstampados.appendChild(img);

      if (index === 0 && (!producto.colores || producto.colores.length === 0)) {
        img.classList.add("selected");
        estampadoSeleccionado = est;
      }
    });
  }

  /* —— Colores —— */
  const contenedorColores = document.getElementById("modal-colores");
  if (contenedorColores) {
    contenedorColores.innerHTML = "";
    (producto.colores || []).forEach((color, index) => {
      const img = document.createElement("img");
      img.src = color.publicUrl || "";
      img.alt = color.codigo || `Color ${index + 1}`;
      img.title = color.codigo || `Color ${index + 1}`;
      img.classList.add("color-img", "color-option");

      img.addEventListener("click", () => {
        document.querySelectorAll(".color-option, .estampado-option").forEach((o) => o.classList.remove("selected"));
        img.classList.add("selected");
        colorSeleccionado = color;
        estampadoSeleccionado = null;
        cargarImagenesSegunSeleccion(producto);
      });

      img.onerror = () => (img.style.display = "none");
      contenedorColores.appendChild(img);

      if (index === 0) {
        img.classList.add("selected");
        colorSeleccionado = color;
      }
    });
  }

  /* —— Imágenes principales —— */
  cargarImagenesSegunSeleccion(producto);

  /* —— Tallas —— */
  const contenedorTallas = document.getElementById("modal-tallas");
  if (contenedorTallas) {
    contenedorTallas.innerHTML = "";
    const disponibles = Object.entries(producto.tallas || {})
      .filter(([, cant]) => cant > 0)
      .map(([t]) => t);

    if (disponibles.length) {
      disponibles.forEach((talla) => {
        const btn = document.createElement("button");
        btn.textContent = talla;
        btn.classList.add("talla-btn");
        btn.addEventListener("click", () => {
          document.querySelectorAll(".talla-btn").forEach((b) => b.classList.remove("selected"));
          btn.classList.add("selected");
        });
        contenedorTallas.appendChild(btn);
      });
    } else {
      contenedorTallas.textContent = "No disponibles";
    }
  }

  /* —— Cantidad —— */
  const increment = document.getElementById("increment");
  const decrement = document.getElementById("decrement");
  const cantidad = document.getElementById("cantidad");
  count = 0;

  increment?.addEventListener("click", () => {
    count++;
    if (cantidad) cantidad.textContent = count;
  });

  decrement?.addEventListener("click", () => {
    if (count > 0) {
      count--;
      if (cantidad) cantidad.textContent = count;
    }
  });

  if (cantidad) cantidad.textContent = count;

  /* —— Descripción —— */
  const btnOpenDescripcion = document.getElementById("btnOpenDescripcion");
  if (btnOpenDescripcion) {
    btnOpenDescripcion.dataset.ref = producto.referencia;
    btnOpenDescripcion.onclick = () => AbrirDescripcionProducto(producto.referencia);
  }

  /* —— Mostrar modal —— */
  modalProducto.style.display = "block";
}

/* =========================== DESDE CARRUSEL ================================ */
export function AbrirProductoComprarDesdeCarrusel(producto) {
  if (!producto?.referencia) return alert("Producto inválido");
  window.productosCargados = window.productosCargados || [];
  if (!window.productosCargados.some((p) => p.referencia === producto.referencia)) {
    window.productosCargados.push(producto);
  }
  AbrirProductoComprar(producto.referencia);
}

/* ======================== EXPOSICIÓN GLOBAL (HTML) ========================= */
window.AbrirProductoComprar = AbrirProductoComprar;
window.AbrirProductoComprarDesdeCarrusel = AbrirProductoComprarDesdeCarrusel;
window.AbrirDescripcionProducto = AbrirDescripcionProducto;
