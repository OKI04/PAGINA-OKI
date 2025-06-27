// productosApp.js
const PLACEHOLDER = "https://via.placeholder.com/640x640?text=Sin+imagen";

/* ----- Helpers ----- */
function obtenerImagenes(prod) {
  const primerColor = prod.colores?.[0];
  const primerEstampado = prod.estampados?.[0];
  const generales = prod.imagenes || [];

  const fuente =
    (primerColor?.imagenes?.length && primerColor.imagenes) ||
    (primerEstampado?.imagenes?.length && primerEstampado.imagenes) ||
    generales;

  const imagenPrincipal =
    fuente[1]?.publicUrl ||
    fuente[0]?.publicUrl ||
    generales[0]?.publicUrl ||
    PLACEHOLDER;

  const imagenesRotacion = (
    fuente.length > 1 ? fuente.slice(1) : generales.slice(1)
  ).map((img) => img.publicUrl);

  return { imagenPrincipal, imagenesRotacion };
}

function pintarColores(items, claseItem, selectedIfFirst) {
  if (!items?.length) return "";
  return `
    <div class="lista-colores">
      <div class="colores-container">
        ${items
          .map(
            (el, i) => `
            <div class="${claseItem} ${
              selectedIfFirst && i === 0 ? "selected" : ""
            }">
              <img src="${el.publicUrl}" class="color-imagen">
            </div>`
          )
          .join("")}
      </div>
    </div>`;
}

function renderProductos(productos, contenedor) {
  contenedor.innerHTML = productos
    .map((p, idx) => {
      const { imagenPrincipal, imagenesRotacion } = obtenerImagenes(p);

      return `
      <div class="product-container">
        <div class="product-card">
          <div class="product-image">
            <img
              src="${imagenPrincipal}"
              alt="${p.nombre}"
              class="main-image"
              id="mainImage-${idx}"
              data-index="${idx}"
              data-rotacion='${JSON.stringify(imagenesRotacion)}'
            />
            <button class="quick-buy" data-producto='${JSON.stringify(p)}'>
              COMPRAR
            </button>
          </div>

          <div class="product-info">
            <div class="product-name">${p.nombre}</div>

            ${pintarColores(p.colores, "color-item", true)}
            ${pintarColores(
              p.estampados,
              "estampado-item",
              p.colores?.length === 0
            )}

            <div class="product-sizes">
              ${
                Object.entries(p.tallas || {})
                  .filter(([, q]) => q > 0)
                  .map(
                    ([t]) => `<span class="size-box" title="Disponible">${t}</span>`
                  )
                  .join("") || '<span class="size-box">No disponibles</span>'
              }
            </div>

            <div class="product-price">
              Precio mayorista:
              <span class="price-value">
                $${p.precio.toLocaleString("es-CO")}
              </span>
            </div>
          </div>
        </div>
      </div>`;
    })
    .join("");

  // Inicializadores si están definidos
  if (typeof inicializarRotacion === "function") inicializarRotacion();
  if (typeof inicializarColorClick === "function") inicializarColorClick();
  if (typeof inicializarEstampadoClick === "function") inicializarEstampadoClick();
}

async function cargarYMostrarProductos() {
  const main = document.querySelector("#producto .main-products");
  const loader = document.querySelector("#producto .spanLoader");

  if (!main || !loader) {
    console.error("No se encontraron #producto .main-products o .spanLoader");
    return;
  }

  try {
    loader.style.display = "inline-block";

    const resp = await fetch(
      "https://pagina-back-oki.onrender.com/admin/products/all"
    );
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);

    const productos = await resp.json();

    if (!productos.length) {
      main.innerHTML = "<p>No hay productos disponibles.</p>";
      return;
    }

    renderProductos(productos, main);
  } catch (err) {
    console.error("Error al cargar productos:", err);
    main.innerHTML = "<p>Error al cargar productos.</p>";
  } finally {
    loader.style.display = "none";
  }
}

document.addEventListener("DOMContentLoaded", cargarYMostrarProductos);
