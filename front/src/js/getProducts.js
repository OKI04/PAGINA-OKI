/*******************************
 * productos.js  (ES module)
 *******************************/
const bodyProduct      = document.querySelector(".main-products");
const tituloProductos  = document.querySelector("#producto h2");

// ——— CONFIG ———
export const baseApiUrl =
  import.meta.env?.VITE_API_URL?.replace(/\/+$/, "")      // .env → Vite
  || "https://pagina-back-oki.onrender.com";              // fallback

const API_ADMIN = `${baseApiUrl}/admin`;

let productosCargados = [];
let animationId;

/* ==========================  LOAD PRODUCTS  ========================== */
async function loadProducts() {
  try {
    // Loader visible
    const loader = document.querySelector(".spanLoader");
    if (loader) loader.style.display = "inline-block";

    /* 1. GET productos ------------------------------------------------- */
    const res = await fetch(`${API_ADMIN}/products/all`, {
      method: "GET",
      credentials: "include",       // Deja credentials si tu backend lo requiere
    });

    if (!res.ok) {
      alert("Error al cargar productos: " + (await res.text()));
      return;
    }

    const productos = await res.json();

    /* 2. Normalizar rutas + publicUrl ---------------------------------- */
    productosCargados = productos.map((prod) => {
      const normImgs = (imgs = []) =>
        imgs.map((img) => {
          const clean = img.url.replace(/\\/g, "/");
          return { ...img, url: clean, publicUrl: `${baseApiUrl}/${clean}` };
        });

      return {
        ...prod,
        imagenes:   normImgs(prod.imagenes),
        colores:    (prod.colores || []).map((c) => ({
                      ...c,
                      imagenes: normImgs(c.imagenes),
                      publicUrl: normImgs(c.imagenes)[0]?.publicUrl || "",
                    })),
        estampados: (prod.estampados || []).map((e) => ({
                      ...e,
                      imagenes: normImgs(e.imagenes),
                      publicUrl: normImgs(e.imagenes)[0]?.publicUrl || "",
                    })),
      };
    });

    /* 3. Render + Carrusel -------------------------------------------- */
    renderProductos(productosCargados);
    await loadCarrusel();
  } catch (err) {
    console.error("loadProducts →", err);
    alert("Error de conexión al cargar productos");
  } finally {
    const loader = document.querySelector(".spanLoader");
    if (loader) loader.remove(); // quita el spinner
  }
}

/* ==========================  LOAD CARRUSEL  ========================== */
async function loadCarrusel() {
  try {
    const res = await fetch(`${API_ADMIN}/carrusel/products/carrusel`, {
      method: "GET",
      credentials: "include",
    });

    if (!res.ok) {
      alert("Error al cargar carrusel: " + (await res.text()));
      return;
    }

    const { carruselItems = [] } = await res.json();
    const refsCarrusel = carruselItems[0]?.productos || [];

    const carruselFiltrado = productosCargados.filter((p) =>
      refsCarrusel.some((r) => r.referencia === p.referencia)
    );

    insertarEnCarrusel(carruselFiltrado, refsCarrusel);
  } catch (err) {
    console.error("loadCarrusel →", err);
    alert("Error de conexión al cargar el carrusel");
  }
}

/* ==========================  RENDER PRINCIPAL  ======================= */
function renderProductos(arr) {
  bodyProduct.innerHTML = arr
    .map((p, idx) => {
      const imgColor =
        p.colores?.[0]?.imagenes?.[1]?.publicUrl ||
        p.estampados?.[0]?.imagenes?.[1]?.publicUrl;

      const imgPrincipal =
        imgColor ||
        p.imagenes?.[0]?.publicUrl ||
        "https://via.placeholder.com/300";

      const rotacion =
        (p.colores?.[0]?.imagenes?.slice(2) ||
          p.imagenes?.slice(1) ||
          []
        ).map((i) => i.publicUrl);

      return `
      <div class="product-container">
        <div class="product-card">
          <div class="product-image">
            <img
              src="${imgPrincipal}"
              alt="${p.nombre}"
              class="main-image"
              data-index="${idx}"
              data-rotacion='${JSON.stringify(rotacion)}'
            />
            <button class="quick-buy" data-producto='${JSON.stringify(p)}'>
              COMPRAR
            </button>
          </div>
          <div class="product-info">
            <div class="product-name">${p.nombre}</div>
            ${dibujarMiniaturas("colores", p.colores)}
            ${dibujarMiniaturas("estampados", p.estampados, !p.colores?.length)}
            <div class="product-sizes">
              ${dibujarTallas(p.tallas)}
            </div>
            <div class="product-price">
              Precio mayorista:
              <span class="price-value">$${p.precio.toLocaleString("es-CO")}</span>
            </div>
          </div>
        </div>
      </div>`;
    })
    .join("");

  inicializarRotacion();
  inicializarColorClick();
  inicializarEstampadoClick();
}

const dibujarMiniaturas = (tipo, lista = [], selectedFirst = false) =>
  lista.length
    ? `<div class="lista-${tipo}">
        <div class="${tipo}-container">
          ${lista
            .map(
              (el, i) => `
            <div class="${tipo.slice(0, -1)}-item ${
                i === 0 && selectedFirst ? "selected" : ""
              }">
              <img src="${el.publicUrl}" class="${tipo.slice(0, -1)}-imagen color-imagen">
            </div>`
            )
            .join("")}
        </div>
      </div>`
    : "";

const dibujarTallas = (obj = {}) =>
  Object.entries(obj)
    .filter(([, qty]) => qty > 0)
    .map(([t]) => `<span class="size-box">${t}</span>`)
    .join("") || '<span class="size-box">No disponibles</span>';

/* ==========================  ROTACIÓN HOVER  ========================= */
function inicializarRotacion() {
  document.querySelectorAll(".main-image").forEach((img) => {
    const rot = JSON.parse(img.dataset.rotacion || "[]");
    if (!rot.length) return;

    let id = null,
      idx = 0;

    const start = () => {
      if (id) return;
      idx = 0;
      id = setInterval(() => {
        img.src = rot[idx];
        idx = (idx + 1) % rot.length;
      }, 1000);
    };

    const stop = () => {
      clearInterval(id);
      id = null;
      img.src = rot[0] ?? img.src;
    };

    img.addEventListener("mouseenter", start);
    img.addEventListener("mouseleave", stop);
  });
}

/* ==========================  CLIC EN COLORES  ======================== */
function inicializarColorClick() {
  document
    .querySelectorAll(".product-card .color-imagen:not(.estampado-imagen)")
    .forEach((img) => {
      img.addEventListener("click", ({ target }) => {
        toggleSeleccion(target, ".color-item, .estampado-item");

        const card = target.closest(".product-card");
        const idx = card.querySelector(".main-image").dataset.index;
        const prod = productosCargados[idx];

        const col = prod.colores.find(
          (c) => c.publicUrl === target.src.split(location.origin).pop()
        );

        if (!col || col.imagenes.length < 2) return;

        actualizarMain(card, col.imagenes);
      });
    });
}

/* ========================  CLIC EN ESTAMPADOS  ======================= */
function inicializarEstampadoClick() {
  document
    .querySelectorAll(".product-card .estampado-imagen")
    .forEach((img) => {
      img.addEventListener("click", ({ target }) => {
        toggleSeleccion(target, ".color-item, .estampado-item");

        const card = target.closest(".product-card");
        const idx = card.querySelector(".main-image").dataset.index;
        const prod = productosCargados[idx];

        const est = prod.estampados.find(
          (e) => e.publicUrl === target.src.split(location.origin).pop()
        );

        if (!est || est.imagenes.length < 2) return;

        actualizarMain(card, est.imagenes);
      });
    });
}

/* ================  Helpers para selección / imagen main ============== */
const toggleSeleccion = (el, selector) => {
  el.closest(".product-card")
    .querySelectorAll(selector)
    .forEach((n) => n.classList.remove("selected"));
  el.parentElement.classList.add("selected");
};

const actualizarMain = (card, imgs) => {
  const main = card.querySelector(".main-image");
  main.src = imgs[1].publicUrl;
  main.dataset.rotacion = JSON.stringify(imgs.slice(2).map((i) => i.publicUrl));
  inicializarRotacion();
};

/* ==========================  CARRUSEL LOOP  ========================== */
const carouselTrack = document.querySelector(".carousel-track");

function insertarEnCarrusel(prodList, refs) {
  cancelAnimationFrame(animationId);

  carouselTrack.innerHTML = "";
  const cards = [];

  prodList.forEach((p) => {
    // localizar la imagen exacta que pidió backend
    let imgCarrusel = p.imagenes[0].publicUrl;

    refs.forEach((r) => {
      if (r.referencia === p.referencia) {
        const src = r.tipo === "colores"
          ? p.colores.find((c) => c.codigo === r.codigo)?.imagenes[1]?.publicUrl
          : p.estampados.find((e) => e.codigo === r.codigo)?.imagenes[1]?.publicUrl;

        if (src) imgCarrusel = src;
      }
    });

    const item = document.createElement("div");
    item.className = "carousel-item";
    item.innerHTML = `
      <img
        src="${imgCarrusel}"
        alt="${p.nombre}"
        onclick='AbrirProductoComprarDesdeCarrusel(${JSON.stringify(p)})'
      />`;
    cards.push(item);
  });

  // duplicar para bucle infinito
  [...cards, ...cards].forEach((c) => carouselTrack.appendChild(c));

  // animación
  const width = cards[0]?.offsetWidth || 0;
  const gap = parseInt(getComputedStyle(cards[0]).marginRight || 0);
  const loopW = (width + gap) * cards.length;
  let offset = 0;
  const speed = 2.5; // px por frame aprox.

  const step = () => {
    offset = (offset + speed) % loopW;
    carouselTrack.style.transform = `translateX(-${offset}px)`;
    animationId = requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

/* ==========================  FILTRO CATEGORÍAS ======================= */
document.addEventListener("DOMContentLoaded", () => {
  loadProducts();

  document.querySelectorAll(".btn-categoria").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const cat = e.currentTarget.dataset.categoria;
      if (cat === "todos") {
        renderProductos(productosCargados);
        tituloProductos.textContent = "TODOS LOS PRODUCTOS";
      } else {
        const filtrados = productosCargados.filter(
          (p) => p.categoria.toLowerCase() === cat.toLowerCase()
        );
        renderProductos(filtrados);
        tituloProductos.textContent = e.currentTarget.textContent.trim().toUpperCase();
      }
    });
  });
});

// Exponer para otros módulos / inline handlers
window.productosCargados = productosCargados;
