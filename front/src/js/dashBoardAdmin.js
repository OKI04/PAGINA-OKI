/* ============================================================
   adminProducts.js  –  Módulo ES listo para producción
   ============================================================ */

/* -------------------------------  GLOBALES  ------------------------------- */
let productosCargados = [];

/* ------------------------  BACKEND_URL (env o fallback)  ------------------ */
const BACKEND_URL = (
  typeof import.meta !== 'undefined' &&
  import.meta.env &&
  import.meta.env.VITE_API_URL
    ? import.meta.env.VITE_API_URL
    : 'https://pagina-back-oki.onrender.com'
).replace(/\/+$/, ''); // quita barras finales duplicadas

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
      mostrarAlerta('Error al registrar usuario');
      console.error(await res.json());
      return;
    }
    mostrarAlerta('Usuario creado correctamente');
  } catch (err) {
    console.error('Error en el registro:', err);
    mostrarAlerta('No se pudo registrar');
  }
});

/* ==========================================================================

  2.  CARGA Y RENDER DE PRODUCTOS
  ------------------------------------------------------------------------ */
export async function loadProducts() {
  const loader = document.getElementById('loader');
  const tbody  = document.getElementById('productTable');
  if (!tbody) return console.error('No se encontró #productTable');

  loader?.classList.remove('d-none');

  try {
    const res = await fetch(`${BACKEND_URL}/admin/products/all`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const productos = await res.json();
    if (!Array.isArray(productos) || !productos.length) {
      tbody.innerHTML =
        `<tr><td colspan="8" class="text-center">No hay productos disponibles.</td></tr>`;
      return;
    }

    productosCargados = productos
      .map((p) => ({
        ...p,
        imagenes  : normalizarImagenes(p.imagenes),
        colores   : normalizarColores(p.colores),
        estampados: normalizarEstampados(p.estampados),
      }))
      .sort((a, b) => b._id.localeCompare(a._id));

    renderTabla(tbody, productosCargados);
  } catch (err) {
    console.error('Error al cargar productos:', err);
    tbody.innerHTML =
      `<tr><td colspan="8" class="text-danger text-center">` +
      `Error al cargar productos</td></tr>`;
  } finally {
    loader?.classList.add('d-none');
  }
}

/* ==========================================================================

  3.  HELPERS DE NORMALIZACIÓN
  ------------------------------------------------------------------------ */
const abs = (rutaRel) => `${BACKEND_URL}/${rutaRel.replace(/^\/+/, '')}`;

const normalizarImagenes = (l=[]) =>
  l.map(img => {
    const ruta = img.url.replace(/\\/g, '/');
    return { ...img, url: ruta, publicUrl: abs(ruta) };
  });

const normalizarColores = (l=[]) =>
  l.map(c => {
    const imgs = normalizarImagenes(c.imagenes);
    return { ...c, imagenes: imgs, publicUrl: imgs[0]?.publicUrl || '' };
  });

const normalizarEstampados = (l=[]) =>
  l.map(e => {
    const imgs = normalizarImagenes(e.imagenes);
    return { ...e, imagenes: imgs, publicUrl: imgs[0]?.publicUrl || '' };
  });

/* ==========================================================================

  4.  RENDER TABLA Y DELEGACIÓN DE EVENTOS
  ------------------------------------------------------------------------ */
function renderTabla(tbody, lista) {
  tbody.innerHTML = lista
    .map(
      (p) => `
      <tr class="fila-producto"
          data-id="${p._id}"
          data-referencia="${(p.referencia ?? '').toLowerCase()}">
        <td>${p.referencia ?? '-'}</td>
        <td>${p.categoria  ?? '-'}</td>
        <td>${p.nombre     ?? '-'}</td>
        <td>${['S','M','L','XL','U'].filter(t=>p.tallas?.[t]>0).join(' - ') || '-'}</td>
        <td>$${p.precio ?? 0}</td>
        <td>${p.colores.map(c=>c.codigo).join(' - ') || '-'}</td>
        <td>${p.estampados.map(e=>e.codigo).join(' - ') || '-'}</td>
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

/* ----------------------  Delegación de eventos (ver / editar)  ---------------------- */
document.getElementById('productTable')?.addEventListener('click', (e) => {
  const btn = e.target.closest('button[data-act]');
  if (!btn) return;

  const tr   = btn.closest('tr[data-id]');
  const id   = tr?.dataset.id;
  const act  = btn.dataset.act;
  if (!id) return;

  if (act === 'ver') {
    return view(id);
  }

  if (act === 'editar') {
    return typeof openEditModal === 'function'
      ? openEditModal(id)
      : console.error('openEditModal no encontrada');
  }

  // Si act === 'eliminar', el modal se abrirá y se encargará de llamar a eliminar()
  // mediante el listener 'show.bs.modal' más abajo.
});

/* -------------------------------------------------------------------
   MODAL CONFIRMACIÓN DE ELIMINAR
------------------------------------------------------------------- */
const modalDelete = document.getElementById('modalDelete');
if (modalDelete) {
  modalDelete.addEventListener('show.bs.modal', (e) => {
    // Botón 🗑️ que disparó el modal
    const triggerBtn = e.relatedTarget;
    const tr         = triggerBtn?.closest('tr[data-id]');
    const id         = tr?.dataset.id;

    // Botón “Confirmar” dentro del modal
    const confirmBtn = modalDelete.querySelector('#btn-confirmar-eliminar');
    if (!confirmBtn) return;

    // Limpia cualquier handler previo y asigna el nuevo
    confirmBtn.onclick = () => eliminar(id);
  });
}

/* ==========================================================================

  5.  BUSCADOR POR CÓDIGO DE REFERENCIA
  ------------------------------------------------------------------------ */
(function buscadorReferencia() {
  const input = document.getElementById('searchInput');
  const tbody = document.getElementById('productTable');
  if (!input || !tbody) return;

  let timer;
  input.addEventListener('input', (e) => {
    clearTimeout(timer);
    const q = e.target.value.trim().toLowerCase();
    timer = setTimeout(() => filtrar(q), 200);
  });

  function filtrar(q) {
    let visibles = 0;
    tbody.querySelectorAll('tr.fila-producto').forEach((fila) => {
      const ref = fila.dataset.referencia;
      const ok  = ref.includes(q);
      fila.style.display = ok ? '' : 'none';
      if (ok) visibles++;
    });
    manejarSinResultados(visibles === 0, q);
  }

  function manejarSinResultados(sin, q) {
    let row = document.getElementById('noResultsRow');
    if (sin) {
      if (!row) {
        row = document.createElement('tr');
        row.id = 'noResultsRow';
        row.innerHTML =
          '<td colspan="8" class="text-center text-muted"></td>';
        tbody.appendChild(row);
      }
      row.firstElementChild.textContent =
        `No se encontraron referencias para “${q}”`;
    } else if (row) {
      row.remove();
    }
  }
})();

/* ==========================================================================

  6.  MODAL “VER PRODUCTO”
  ------------------------------------------------------------------------ */
function view(id) {
  const p = productosCargados.find(x => x._id === id);
  if (!p) return mostrarAlerta('Producto no encontrado');

  const base  = p.imagenes || [];
  const gCol  = p.colores?.[0]?.imagenes?.length ? p.colores[0].imagenes : null;
  const gEst  = !gCol && p.estampados?.[0]?.imagenes?.length ? p.estampados[0].imagenes : null;
  const gal   = gCol || gEst || base;
  if (!gal.length) return mostrarAlerta('Producto sin imágenes');

  const principal   = gal[1]?.publicUrl ?? gal[0].publicUrl;
  const miniaturas  = gal.slice(1);

  const body = document.querySelector('#modalView .modal-body');
  body.innerHTML = plantillaProducto(p, principal, miniaturas);
  const modal = bootstrap.Modal.getOrCreateInstance('#modalView');
  modal.show();

  body.addEventListener('click', handlerImgs);
  function handlerImgs(e) {
    const sel = e.target.closest('img[data-tipo]');
    if (sel) {
      const tipo = sel.dataset.tipo, idx = +sel.dataset.index;
      const arr  = tipo === 'color'
        ? p.colores?.[idx]?.imagenes
        : tipo === 'estampado'
        ? p.estampados?.[idx]?.imagenes
        : [];
      if (arr?.length) actualizarGaleria(arr);
      return;
    }
    const mini = e.target.closest('img.miniatura');
    if (mini) cambiarPrincipal(mini.src);
  }
  function actualizarGaleria(arr) {
    cambiarPrincipal(arr[1]?.publicUrl ?? arr[0].publicUrl);
    body.querySelector('#imagenesSecundarias').innerHTML = arr
      .slice(1)
      .map(i => `<img src="${i.publicUrl}" class="miniatura" />`)
      .join('');
  }
  function cambiarPrincipal(url) {
    const img = body.querySelector('#mainImage');
    if (img) img.src = url;
  }
}

/* ---------------- Plantilla modal ---------------- */
function plantillaProducto(p, principal, secundarias) {
  const miniHTML = secundarias
    .map(i => `<img src="${i.publicUrl}" class="miniatura" style="cursor:pointer;max-width:50px;margin-right:5px;" />`)
    .join('');

  const bloque = (arr, tipo) => arr?.length ? `
    <div class="${tipo === 'color' ? 'colores' : 'estampados'}">
      <div class="lista-colores"></div>
      <div class="colores-container">
        ${arr.map((x, i) => `
          <div class="color-item">
            <img src="${x.publicUrl}" alt="${x.codigo}"
                 class="color-imagen${tipo==='estampado'?' estampado-imagen':''}"
                 data-tipo="${tipo}" data-index="${i}" style="cursor:pointer;" />
            <div class="color-codigo">${x.codigo}</div>
          </div>`).join('')}
      </div>
    </div>` : '';

  const talla = (v, t) => v > 0 ? `<span class="talla-letra">${t}</span>` : '';

  return `
  <div class="plantilla"><div class="plantilla-container">
    <div class="imagen-y-miniaturas">
      <div class="imagenes-secundarias" id="imagenesSecundarias">${miniHTML}</div>
      <div class="imagen-principal"><img id="mainImage" class="main-image" src="${principal}" style="max-width:100%;" /></div>
    </div>

    <div class="detalles-producto">
      <div class="nombre-modelo">${p.nombre}</div>
      <div class="referencia">Referencia: ${p.referencia}</div>
      <div class="precio">$${Number(p.precio).toLocaleString('es-CO')}</div>

      ${bloque(p.colores, 'color')}
      ${bloque(p.estampados, 'estampado')}

      <div class="lista-colores"><strong>TALLA</strong></div>
      <div class="talla">
        ${talla(p.tallas?.S, 'S')}
        ${talla(p.tallas?.M, 'M')}
        ${talla(p.tallas?.L, 'L')}
        ${talla(p.tallas?.XL, 'XL')}
        ${talla(p.tallas?.U, 'U')}
      </div>

      ${p.descripcion
        ? `<div class="descripcion-container mt-3">
             <div class="lista-colores">DESCRIPCIÓN</div>
             <div class="descripcion">${p.descripcion}</div>
           </div>`
        : ''}
    </div>
  </div></div>`;
}

// =========================================================================
// 7. ELIMINAR PRODUCTO
// -------------------------------------------------------------------------
export async function eliminar(id) {
  console.log('action: eliminar', id);
  
  console.log("Id url: " + _id);

  try {
   
     const res = await fetch(`/admin/products/delete/${_id}`, {
       method: 'DELETE',
       credentials: 'include'    // si usas cookie HttpOnly
     });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(errText || `HTTP ${res.status}`);
    }

    mostrarAlerta('Producto eliminado');
    await loadProducts();                                // refresca la tabla
    bootstrap.Modal.getInstance('#modalDelete')?.hide(); // cierra el modal
  } catch (err) {
    console.error('Error al eliminar producto:', err);
    mostrarAlerta('El producto no fue eliminado');
  }
}

/* ==========================================================================

  8.  UTILIDADES (alerta modal simple)
  ------------------------------------------------------------------------ */
function mostrarAlerta(mensaje, ms = 3000) {
  const modal   = document.getElementById('alertModal');
  const mensajeEl = document.getElementById('alertMessage');
  if (!modal || !mensajeEl) return alert(mensaje);

  mensajeEl.textContent = mensaje;
  modal.style.display = 'flex';
  if (ms) setTimeout(() => modal.style.display = 'none', ms);
}

/* ==========================================================================

  9.  AUTO‑EJECUCIÓN
  ------------------------------------------------------------------------ */
window.loadProducts = loadProducts;
window.eliminar = eliminar;
document.addEventListener('DOMContentLoaded', loadProducts);
