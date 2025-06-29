// -----------------------------------------------------------------------------
// Selección de nodos y constantes globales
// -----------------------------------------------------------------------------
const bodyProduct   = document.querySelector('#producto .main-products');
const loader        = document.querySelector('#producto .spanLoader');
const tituloProductos = document.querySelector('#producto h2');

// Usa siempre la URL absoluta del backend
export const BACKEND_URL = 'https://pagina-back-oki.onrender.com';

let productosCargados = [];
let carrusel          = [];

// -----------------------------------------------------------------------------
// Helpers de normalización
// -----------------------------------------------------------------------------
const limpiarRuta = ruta => (ruta || '').replace(/\\/g, '/');

const normalizarImagenes = (imagenes = []) =>
  imagenes.map(img => {
    const ruta = limpiarRuta(img.url);
    return { ...img, url: ruta, publicUrl: `${BACKEND_URL}/${ruta}` };
  });

const normalizarColores = (colores = []) =>
  colores.map(color => {
    const imagenes = normalizarImagenes(color.imagenes);
    return { ...color, imagenes, publicUrl: imagenes[0]?.publicUrl || '' };
  });

const normalizarEstampados = (estampados = []) =>
  estampados.map(est => {
    const imagenes = normalizarImagenes(est.imagenes);
    return { ...est, imagenes, publicUrl: imagenes[0]?.publicUrl || '' };
  });

// -----------------------------------------------------------------------------
// Carga de productos
// -----------------------------------------------------------------------------
export async function loadProducts () {
  if (!bodyProduct || !loader) {
    console.error('No se encontraron .main-products o .spanLoader');
    return;
  }

  try {
    loader.style.display = 'inline-block';

    // 1. Petición directa al backend (sin credentials)
    const res = await fetch(`${BACKEND_URL}/admin/products/all`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    // 2. Datos recibidos
    const productos = await res.json();
    if (!productos.length) {
      bodyProduct.innerHTML = '<p class="text-center">No hay productos disponibles.</p>';
      return;
    }

    // 3. Normalización
    productosCargados = productos.map(prod => ({
      ...prod,
      imagenes  : normalizarImagenes (prod.imagenes),
      colores   : normalizarColores (prod.colores),
      estampados: normalizarEstampados(prod.estampados)
    }));

    // 4. Render y carrusel
    renderProductos(productosCargados);
    await loadCarrusel();

  } catch (err) {
    console.error('Error al cargar productos:', err);
    bodyProduct.innerHTML = '<p class="text-danger text-center">Error al cargar productos.</p>';
  } finally {
    loader.style.display = 'none';
  }
}

// -----------------------------------------------------------------------------
// Carga de carrusel
// -----------------------------------------------------------------------------
async function loadCarrusel () {
  try {
    const res = await fetch(`${BACKEND_URL}/admin/carrusel/products/carrusel`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const data       = await res.json();
    const idsCarr    = data.carruselItems?.[0]?.productos || [];

    carrusel = filtrarCarrusel(productosCargados, idsCarr);
    insertarEnCarrusel(carrusel, idsCarr);

  } catch (err) {
    console.error('Error al cargar carrusel:', err);
  }
}

// -----------------------------------------------------------------------------
// Exporta helpers si los necesitas en otros módulos
// -----------------------------------------------------------------------------
export {
  limpiarRuta,
  normalizarImagenes,
  normalizarColores,
  normalizarEstampados
};


// -----------------------------------------------------------------------------
// Renderizado de productos y UI helpers
// -----------------------------------------------------------------------------
function renderProductos(productos) {
  bodyProduct.innerHTML = productos.map((p, index) => {
    const primerColor     = p.colores?.[0];
    const primerEstampado = p.estampados?.[0];
    const imagenesGenerales = p.imagenes || [];

    let imagenesColor = [];
    if (primerColor && primerColor.imagenes?.length > 0) {
      imagenesColor = primerColor.imagenes;
    } else if (primerEstampado && primerEstampado.imagenes?.length > 0) {
      imagenesColor = primerEstampado.imagenes;
    }

    let imagenPrincipal = imagenesColor[1]?.publicUrl ||
                          imagenesColor[0]?.publicUrl ||
                          imagenesGenerales[0]?.publicUrl || '';

    let imagenesRotacion = imagenesColor.length > 1
      ? imagenesColor.slice(1).map(img => img.publicUrl)
      : imagenesGenerales.slice(1).map(img => img.publicUrl);

    return `
      <div class="product-container">
        <div class="product-card">
          <div class="product-image">
            <img 
              src="${imagenPrincipal}" 
              alt="Vista" 
              class="main-image" 
              id="mainImage-${index}" 
              data-index="${index}" 
              data-rotacionactiva='${JSON.stringify(imagenesRotacion)}'
            />
            <button class="nav-arrow prev-arrow" aria-label="Anterior">&#10094;</button>
            <button class="nav-arrow next-arrow" aria-label="Siguiente">&#10095;</button>
            <button class="quick-buy" data-producto='${JSON.stringify(p)}'>COMPRAR</button>
          </div>
          <div class="product-info">
            <div class="product-name">${p.nombre}</div> 
            <div class="product-colors">
              ${p.colores?.length > 0 ? `
                <div class="lista-colores">
                  <div class="colores-container">
                    ${p.colores.map((color, i) => `
                      <div class="color-item ${i === 0 ? 'selected' : ''}">
                        <img src="${color.publicUrl}" class="color-imagen">   
                      </div>
                    `).join('')}
                  </div>
                </div>
              ` : ''}
            </div>
            <div class="product-colors">
              ${p.estampados?.length > 0 ? `
                <div class="lista-colores">
                  <div class="colores-container">
                    ${p.estampados.map((estampado, i) => `
                      <div class="estampado-item ${(p.colores?.length === 0 && i === 0) ? 'selected' : ''}">
                        <img src="${estampado.publicUrl}" class="estampado-imagen ">
                      </div>
                    `).join('')}
                  </div>
                </div>
              ` : ''}
            </div>
            <div class="product-sizes">
              ${Object.entries(p.tallas || {})
                .filter(([_, cantidad]) => cantidad > 0)
                .map(([talla]) => `<span class="size-box">${talla}</span>`).join('') || '<span class="size-box">No disponibles</span>'}
            </div>
            <div class="product-price">
              Precio mayorista: <span class="price-value">$${p.precio.toLocaleString('es-CO')}</span>
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('');

/* ❷ Cambia la lista de inicializaciones */

  inicializarRotacion();
  inicializarColorClick();
  inicializarEstampadoClick();
  inicializarNavArrows()
}
function inicializarNavArrows() {
  document.querySelectorAll(".product-card").forEach(card => {
    const img  = card.querySelector(".main-image");
    const prev = card.querySelector(".prev-arrow");
    const next = card.querySelector(".next-arrow");

    // Si el producto no tiene rotación, oculta flechas y sal
    const lista = JSON.parse(img.dataset.rotacionactiva || "[]");
    if (lista.length === 0) {
      prev.style.display = next.style.display = "none";
      return;
    }
    prev.style.display = next.style.display = "";    // por si antes estaban ocultas

    let current = 0;

    const mostrar = () => { img.src = lista[current]; };

    prev.onclick = e => { e.stopPropagation(); current = (current - 1 + lista.length) % lista.length; mostrar(); };
    next.onclick = e => { e.stopPropagation(); current = (current + 1) % lista.length; mostrar(); };
  });
}


function inicializarRotacion() {
  document.querySelectorAll('.main-image').forEach(img => {
    const imagenesRotacion = JSON.parse(img.dataset.rotacionactiva || "[]");
    if (imagenesRotacion.length === 0) return;

    let intervalId = null;
    let currentIndex = 0;

    function startRotation() {
      if (intervalId !== null) return; // Ya está rotando
      currentIndex = 0;
      intervalId = setInterval(() => {
        img.src = imagenesRotacion[currentIndex];
        currentIndex = (currentIndex + 1) % imagenesRotacion.length;
      }, 1000);
    }

    function stopRotation() {
      clearInterval(intervalId);
      intervalId = null;
      currentIndex = 0;
      img.src = imagenesRotacion[0]; // Imagen principal al salir
    }

    img.addEventListener("mouseenter", startRotation);
    img.addEventListener("mouseleave", stopRotation);
  });
}


function inicializarColorClick() {
  document.querySelectorAll(".product-colors .color-imagen:not(.estampado-imagen)").forEach(colorImg => {
    colorImg.addEventListener("click", (e) => {
      const card = e.target.closest(".product-card");

      // Limpiar selección previa
      card.querySelectorAll(".color-item, .estampado-item").forEach(item => item.classList.remove("selected"));
      e.target.parentElement.classList.add("selected");

      const mainImg = card.querySelector(".main-image");
      const index = mainImg.dataset.index;
      const producto = productosCargados[index];

      const srcRelativa = new URL(colorImg.src).pathname;
      const colorSeleccionado = producto.colores.find(c => new URL(c.publicUrl, location.origin).pathname === srcRelativa);

      if (!colorSeleccionado || colorSeleccionado.imagenes.length < 2) return;

      mainImg.src = colorSeleccionado.imagenes[1].publicUrl; // Mostrar la segunda imagen
      const imagenesRotacion = colorSeleccionado.imagenes.slice(2).map(img => img.publicUrl); // Rotar desde la tercera
      mainImg.dataset.rotacionactiva = JSON.stringify(imagenesRotacion);
      inicializarRotacion();
      inicializarNavArrows()
    });
  });
}

function inicializarEstampadoClick() {
  document.querySelectorAll(".product-colors .estampado-imagen").forEach(estampadoImg => {
    estampadoImg.addEventListener("click", (e) => {
      const card = e.target.closest(".product-card");

      // Limpiar selección previa
      card.querySelectorAll(".color-item, .estampado-item").forEach(item => item.classList.remove("selected"));
      e.target.parentElement.classList.add("selected");

      const mainImg = card.querySelector(".main-image");
      const index = mainImg.dataset.index;
      const producto = productosCargados[index];

      const srcRelativa = new URL(estampadoImg.src).pathname;
      const estampadoSeleccionado = producto.estampados.find(e => new URL(e.publicUrl, location.origin).pathname === srcRelativa);

      if (!estampadoSeleccionado || estampadoSeleccionado.imagenes.length < 2) return;

      mainImg.src = estampadoSeleccionado.imagenes[1].publicUrl; // Mostrar la segunda imagen
      const imagenesRotacion = estampadoSeleccionado.imagenes.slice(2).map(img => img.publicUrl); // Rotar desde la tercera
      mainImg.dataset.rotacionactiva = JSON.stringify(imagenesRotacion);
      inicializarRotacion();
      inicializarNavArrows()
    });
  });
}
// --- Carrusel ----------------------------------------------------------------
const carouselTrack = document.querySelector(".carousel-track");
let animationId;

function filtrarCarrusel(arrayBase, arrayFiltro) {
  const referenciasValidas = arrayFiltro.map(item => item.referencia);
  return arrayBase.filter(item =>
    referenciasValidas.includes(item.referencia)
  );
}

function insertarEnCarrusel(carrusel, res) {
  carouselTrack.innerHTML = "";
  const allCards = [];

  carrusel.forEach(producto => {
    let imagenCarrusel = '';

    for (let i = 0; i < res.length; i++) {
      if (res[i].referencia === producto.referencia) {
        if (res[i].tipo === 'colores') {
          for (let j = 0; j < producto.colores.length; j++) {
            if (producto.colores[j].codigo === res[i].codigo) {
              imagenCarrusel = producto.colores[j].imagenes[1].publicUrl;
            }
          }
        } else {
          for (let j = 0; j < producto.estampados.length; j++) {
            if (producto.estampados[j].codigo === res[i].codigo) {
              imagenCarrusel = producto.estampados[j].imagenes[1].publicUrl;
            }
          }
        }
      }
    }

    const card = document.createElement("div");
    card.className = "carousel-item";
    card.innerHTML = `
      <img 
        src="${imagenCarrusel}" 
        alt="${producto.nombre}" 
        data-id="${producto.referencia}"
        onclick='AbrirProductoComprarDesdeCarrusel(${JSON.stringify(producto)})'
      >
    `;
    allCards.push(card);
  });

  // Duplicar para efecto infinito
  allCards.forEach(card => carouselTrack.appendChild(card));
  allCards.forEach(card => carouselTrack.appendChild(card.cloneNode(true)));

  carouselTrack.style.transition = "none";
  startAutoScroll(allCards.length);
}

function startAutoScroll(originalItemCount) {
  cancelAnimationFrame(animationId); // Detiene cualquier animación anterior

  const items = document.querySelectorAll(".carousel-item");
  if (!items.length) return;

  const itemWidth = items[0].offsetWidth;
  const spacing = parseInt(getComputedStyle(items[0]).marginRight || 0);
  const loopWidth = (itemWidth + spacing) * originalItemCount;

  const speed = 3.5; // velocidad (~150px/s)
  let offset = 0;

  function step() {
    offset += speed;
    if (offset >= loopWidth) {
      offset -= loopWidth; // Reinicia sin salto
    }
    carouselTrack.style.transform = `translateX(-${offset}px)`;
    animationId = requestAnimationFrame(step);
  }

  animationId = requestAnimationFrame(step);
}

// -----------------------------------------------------------------------------
// Arranque
// -----------------------------------------------------------------------------
document.addEventListener("DOMContentLoaded", () => {
  loadProducts();

  const botonesCategoria = document.querySelectorAll(".btn-categoria");

  botonesCategoria.forEach((boton) => {
    boton.addEventListener("click", (e) => {
      const categoriaSelect = e.target.dataset.categoria;

      if (categoriaSelect !== "todos") {
        const filtrados = productosCargados.filter(
          (prod) => prod.categoria.toLowerCase() === categoriaSelect.toLowerCase()
        );
        renderProductos(filtrados);
        tituloProductos.textContent = e.target.textContent.trim().toUpperCase();
      } else {
        renderProductos(productosCargados);
        tituloProductos.textContent = "TODOS LOS PRODUCTOS";
      }
    });
  });
});

// === EXPONER VARIABLES GLOBALES ===
window.productosCargados = productosCargados;
