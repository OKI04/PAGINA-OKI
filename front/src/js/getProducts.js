const bodyProduct = document.querySelector(".main-products");
const tituloProductos = document.querySelector("#producto h2");
export const baseApiUrl =
  import.meta.env.VITE_API_URL;
let productosCargados = [];
let carrusel = [];

   async function loadProducts() {
  try {
    const res = await fetch(`${baseApiUrl}/admin/products/all`, {
      method: 'GET',
      credentials: 'include'
    });

    if (!res.ok) {
      const err = await res.text();
      alert('Error al cargar productos: ' + err);
      return; 
    }

    const productos = await res.json();

    productosCargados = productos.map(prod => {
      const imagenesNorm = (prod.imagenes || []).map(img => {
        const rutaLimpia = img.url.replace(/\\/g, "/");
        return {
          ...img,
          url: rutaLimpia,
          publicUrl: `${baseApiUrl}/${rutaLimpia}`
        };
      });

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
          publicUrl: imagenesColor[0]?.publicUrl || ''
        };
      });

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

    const loader = document.querySelector('.spanLoader');
    if (loader) loader.remove();

    renderProductos(productosCargados);
    loadCarrusel(); // ✅ se llama solo si productos se cargan bien

  } catch (error) {
    console.error('Error en loadProducts:', error);
    alert('Error de conexión al cargar productos');
  }
}

async function loadCarrusel() {
  try {
    const res = await fetch(`/admin/carrusel/products/carrusel`, {
      method: 'GET',
      credentials: 'include'
    });

    if (!res.ok) {
      const err = await res.text();
      alert('Error al cargar carrusel: ' + err);
      return;
    }

    const data = await res.json();
    const productos = data.carruselItems?.[0]?.productos || [];

    // Usa la variable global productosCargados
    const carrusel = filtrarCarrusel(productosCargados, productos);
    insertarEnCarrusel(carrusel, productos);

  } catch (error) {
    console.error('Error en loadCarrusel:', error);
    alert('Error de conexión al cargar el carrusel');
  }
}

function renderProductos(productos) {
  bodyProduct.innerHTML = productos.map((p, index) => {
    const primerColor = p.colores?.[0];
    const primerEstampado = p.estampados?.[0];
    const imagenesGenerales = p.imagenes || [];

    let imagenesColor = [];
    if (primerColor && primerColor.imagenes?.length > 0) {
      imagenesColor = primerColor.imagenes;
    } else if (primerEstampado && primerEstampado.imagenes?.length > 0) {
      imagenesColor = primerEstampado.imagenes;
    }

    let imagenPrincipal = imagenesColor[1]?.publicUrl || imagenesColor[0]?.publicUrl || imagenesGenerales[0]?.publicUrl || '';

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
                        <img src="${estampado.publicUrl}" class="estampado-imagen color-imagen">
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

  inicializarRotacion();
  inicializarColorClick();
  inicializarEstampadoClick();
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
    });
  });
}

//document.addEventListener("DOMContentLoaded", loadProducts);

// --- Carrusel ---

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

  const speed = 3.5; // velocidad aumentada (~150px/s)
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


/**
 * Carga productos y configura filtros por categoría
 */
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