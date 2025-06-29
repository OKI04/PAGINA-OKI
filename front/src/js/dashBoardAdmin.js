/* ============================================================
   adminProducts.js  –  Módulo ES listo para producción
   ============================================================ */

/* -------------------------------  GLOBALES  ------------------------------- */
let productosCargados = [];
let formularioId = 0;
const arrayList = [];

/* ------------------------  BACKEND_URL (env o fallback)  ------------------ */
const BACKEND_URL = (
  typeof import.meta !== 'undefined' &&
  import.meta.env &&
  import.meta.env.VITE_API_URL
    ? import.meta.env.VITE_API_URL   // .env.production / .env.development
    : 'https://pagina-back-oki.onrender.com'
).replace(/\/+$/, '');                // quita barras finales duplicadas

/* ==========================================================================

  1.  REGISTRO DE USUARIO
  ------------------------------------------------------------------------ */
const userForm = document.getElementById('formRegister');
userForm?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const nombre   = document.getElementById('name').value.trim();
  const email    = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;

  try {
    const res = await fetch(`${BACKEND_URL}/admin/register`, {
      method : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body   : JSON.stringify({ nombre, email, password }),
    });

    if (!res.ok) {
      const error = await res.json();
      console.error('Error al registrar:', error);
      return;
    }

    const data = await res.json();
    console.log('✅ Usuario creado:', data);
  } catch (err) {
    console.error('Error en el registro:', err);
  }
});

/* ==========================================================================

  2.  CARGA Y RENDER DE PRODUCTOS
  ------------------------------------------------------------------------ */
export async function loadProducts() {
  const loader = document.getElementById('loader');
  const tbody  = document.getElementById('productTable');

  if (!tbody) {
    console.error('No se encontró el elemento productTable');
    return;
  }

  loader?.classList.remove('d-none');

  try {
    // --- 2.1) Petición al backend (sin credentials) ---
    const res = await fetch(`${BACKEND_URL}/admin/products/all`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    // --- 2.2) Datos recibidos ---
    const productos = await res.json();
    if (!Array.isArray(productos) || !productos.length) {
      tbody.innerHTML =
        `<tr><td colspan="8" class="text-center">No hay productos disponibles.</td></tr>`;
      return;
    }

    // --- 2.3) Normalizar ---
    productosCargados = productos
      .map((p) => ({
        ...p,
        imagenes  : normalizarImagenes  (p.imagenes),
        colores   : normalizarColores   (p.colores),
        estampados: normalizarEstampados(p.estampados),
      }))
      .sort((a, b) => b._id.localeCompare(a._id));

    // --- 2.4) Renderizar tabla ---
    renderTabla(tbody, productosCargados);
    console.log(`✅ ${productosCargados.length} productos cargados`);
  } catch (err) {
    console.error('Error al cargar productos:', err);
    tbody.innerHTML =
      `<tr><td colspan="8" class="text-danger text-center">` +
      `Error al cargar productos: ${err.message}</td></tr>`;
  } finally {
    loader?.classList.add('d-none');
  }
}

/* ==========================================================================

  3.  HELPERS DE NORMALIZACIÓN
  ------------------------------------------------------------------------ */
const abs = (rutaRel) => `${BACKEND_URL}/${rutaRel.replace(/^\/+/, '')}`;

function normalizarImagenes(lista = []) {
  return (Array.isArray(lista) ? lista : []).map((img) => {
    const ruta = img.url.replace(/\\/g, '/');
    return { ...img, url: ruta, publicUrl: abs(ruta) };
  });
}

function normalizarColores(lista = []) {
  return (Array.isArray(lista) ? lista : []).map((c) => {
    const imgs = normalizarImagenes(c.imagenes);
    return { ...c, imagenes: imgs, publicUrl: imgs[0]?.publicUrl ?? '' };
  });
}

function normalizarEstampados(lista = []) {
  return (Array.isArray(lista) ? lista : []).map((e) => {
    const imgs = normalizarImagenes(e.imagenes);
    return { ...e, imagenes: imgs, publicUrl: imgs[0]?.publicUrl ?? '' };
  });
}

/* ==========================================================================

  4.  RENDER DE TABLA + DELEGACIÓN DE EVENTOS
  ------------------------------------------------------------------------ */
function renderTabla(tbody, lista) {
  tbody.innerHTML = lista
    .map(
      (p) => `
      <tr data-id="${p._id}">
        <td>${p.referencia ?? '-'}</td>
        <td>${p.categoria  ?? '-'}</td>
        <td>${p.nombre     ?? '-'}</td>
        <td>${['S','M','L','XL','U']
              .filter((t) => p.tallas?.[t] > 0).join(' - ') || '-'}</td>
        <td>$${p.precio ?? 0}</td>
        <td>${p.colores.map(c => c.codigo).join(' - ')   || '-'}</td>
        <td>${p.estampados.map(e => e.codigo).join(' - ')|| '-'}</td>
        <td>
          <button class="btn btn-primary btn-sm" data-act="ver">Ver</button>
          <button class="btn btn-success btn-sm" data-act="editar">Editar</button>
          <button class="btn btn-danger  btn-sm" data-act="eliminar"
                  data-bs-toggle="modal" data-bs-target="#modalDelete">
            Eliminar
          </button>
        </td>
      </tr>`
    )
    .join('');
}

/* -- Un solo listener para todo el <tbody> -- */
document.getElementById('productTable')?.addEventListener('click', (e) => {
  const btn = e.target.closest('button[data-act]');
  if (!btn) return;

  const tr      = btn.closest('tr[data-id]');
  const id      = tr?.dataset.id;
  const accion  = btn.dataset.act;

  if (!id) return;

  switch (accion) {
    case 'ver':
      return typeof view === 'function'
        ? view(id)
        : console.error('Función view no encontrada');
    case 'editar':
      return typeof openEditModal === 'function'
        ? openEditModal(id)
        : console.error('Función openEditModal no encontrada');
    case 'eliminar':
      prepararEliminacion(id);
      break;
  }
});

/* ------------------------------------------------------------------ */
function prepararEliminacion(id) {
  const btnConfirm = document.getElementById('btn-confirmar-eliminar');
  if (!btnConfirm) return;

  const newBtn = btnConfirm.cloneNode(true);
  btnConfirm.replaceWith(newBtn);

  newBtn.addEventListener('click', () => {
    if (typeof eliminar === 'function') eliminar(id);
    else console.error('Función eliminar no encontrada');
  });
}

/* ==========================================================================

  5.  MODAL “VER PRODUCTO”
  ------------------------------------------------------------------------ */
async function view(id) {
  const producto = productosCargados.find(p => p._id === id);
  if (!producto) return mostrarAlerta('Producto no encontrado');

  // Selección de galería con prioridad
  const galBase  = producto.imagenes || [];
  const galColor = producto.colores?.[0]?.imagenes?.length ? producto.colores[0].imagenes : null;
  const galEst   = !galColor && producto.estampados?.[0]?.imagenes?.length ? producto.estampados[0].imagenes : null;

  const galeria = galColor || galEst || galBase;
  if (!galeria.length) return mostrarAlerta('Producto sin imágenes');

  // 👉 Mostrar desde la segunda imagen
  const principal = galeria[1]?.publicUrl ?? galeria[0].publicUrl;
  const secundarias = galeria.slice(1); // miniaturas desde la segunda

  const modalBody = document.querySelector('#modalView .modal-body');
  modalBody.innerHTML = plantillaProducto(producto, principal, secundarias);

  const modal = bootstrap.Modal.getOrCreateInstance('#modalView');
  modal.show();

  // Listeners
  modalBody.addEventListener('click', (e) => {
    const imgSel = e.target.closest('img[data-tipo]');
    if (imgSel) {
      const tipo = imgSel.dataset.tipo;
      const idx = +imgSel.dataset.index;
      const origen =
        tipo === 'color'     ? producto.colores?.[idx]?.imagenes :
        tipo === 'estampado' ? producto.estampados?.[idx]?.imagenes : [];

      if (origen?.length) actualizarGaleria(origen);
      return;
    }
    const mini = e.target.closest('img.miniatura');
    if (mini) cambiarPrincipal(mini.src);
  });

  function actualizarGaleria(imgs) {
    const princ = imgs[1]?.publicUrl ?? imgs[0].publicUrl;
    const minis = imgs.slice(1); // miniaturas desde la segunda

    cambiarPrincipal(princ);
    const cont = modalBody.querySelector('#imagenesSecundarias');
    cont.innerHTML = minis
      .map(i => `<img src="${i.publicUrl}" class="miniatura" />`)
      .join('');
  }

  function cambiarPrincipal(url) {
    const main = modalBody.querySelector('#mainImage');
    if (main) main.src = url;
  }
}


/* ============================================================
   Plantilla del modal – respeta el estilo original
   ============================================================ */
function plantillaProducto(unicoProducto, principal, secundarias) {
  const miniaturasHTML = secundarias
    .map(
      (img) => `
        <img src="${img.publicUrl}" 
             class="miniatura" 
             style="cursor:pointer; max-width:50px; margin-right:5px;" />
      `
    )
    .join('');

  const coloresHTML = unicoProducto.colores?.length
    ? `
      <div class="colores">
        <div class="lista-colores"></div>
        <div class="colores-container">
          ${unicoProducto.colores
            .map(
              (color, index) => `
                <div class="color-item">
                  <img src="${color.publicUrl || ''}"
                       alt="${color.codigo}"
                       class="color-imagen"
                       data-tipo="color"
                       data-index="${index}"
                       style="cursor:pointer;" />
                  <div class="color-codigo">${color.codigo}</div>
                </div>
            `
            )
            .join('')}
        </div>
      </div>`
    : '';

  const estampadosHTML = unicoProducto.estampados?.length
    ? `
      <div class="estampados">
        <div class="lista-colores"></div>
        <div class="colores-container">
          ${unicoProducto.estampados
            .map(
              (estampado, index) => `
                <div class="color-item">
                  <img src="${estampado.publicUrl || ''}"
                       alt="${estampado.codigo}"
                       class="color-imagen estampado-imagen"
                       data-tipo="estampado"
                       data-index="${index}"
                       style="cursor:pointer;" />
                  <div class="color-codigo">${estampado.codigo}</div>
                </div>
            `
            )
            .join('')}
        </div>
      </div>`
    : '';

  // Aquí solo mostramos la letra si tiene cantidad mayor a 0
  const mostrarTalla = (cantidad, talla) =>
    cantidad > 0 ? `<span class="talla-letra">${talla}</span>` : '';

  return `
    <div class="plantilla">
      <div class="plantilla-container">
        <div class="imagen-y-miniaturas">
          <div class="imagenes-secundarias" id="imagenesSecundarias">
            ${miniaturasHTML}
          </div>
          <div class="imagen-principal">
            <img id="mainImage"
                 class="main-image"
                 src="${principal}"
                 alt="Imagen principal"
                 style="max-width:100%;" />
          </div>
        </div>

        <div class="detalles-producto">
          <div class="nombre-modelo">${unicoProducto.nombre}</div>
          <div class="referencia">Referencia: ${unicoProducto.referencia}</div>
          <div class="precio">
            $${Number(unicoProducto.precio).toLocaleString('es-CO')}
          </div>

          ${coloresHTML}
          ${estampadosHTML}

          <div class="lista-colores"><strong>TALLA</strong></div>
          <div class="talla">
            ${mostrarTalla(unicoProducto.tallas?.S, 'S')}
            ${mostrarTalla(unicoProducto.tallas?.M, 'M')}
            ${mostrarTalla(unicoProducto.tallas?.L, 'L')}
            ${mostrarTalla(unicoProducto.tallas?.XL, 'XL')}
            ${mostrarTalla(unicoProducto.tallas?.U, 'U')}
          </div>

          ${
            unicoProducto.descripcion
              ? `
              <div class="descripcion-container" style="margin-top:1rem;">
                <div class="lista-colores">DESCRIPCIÓN</div>
                <div class="descripcion">${unicoProducto.descripcion}</div>
              </div>`
              : ''
          }
        </div>
      </div>
    </div>
  `;
}



/* ==========================================================================

   EXPOSICIÓN GLOBAL Y AUTO‑EJECUCIÓN
  ------------------------------------------------------------------------ */
window.loadProducts = loadProducts;
document.addEventListener('DOMContentLoaded', loadProducts);
