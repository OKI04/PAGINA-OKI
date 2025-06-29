/* ==========================================================================
   utilidades.js  (ES module — importable y usable con type="module")
   ========================================================================== */

/** ---------------------------------------------------------------------
 *  Rellena un <select> con las opciones indicadas
 *  @param {string} id        – id del <select>
 *  @param {string[]} opciones – array de valores / textos
 * --------------------------------------------------------------------- */
export function llenarSelect(id, opciones = []) {
  const select = document.getElementById(id);
  if (!select) return;
  select.innerHTML = '';
  opciones.forEach((opcion) => {
    const opt = document.createElement('option');
    opt.value = opcion;
    opt.textContent = opcion;
    select.appendChild(opt);
  });
}

/* ----------------------------------------------------------------------
   Modal de inicio de sesión
   ---------------------------------------------------------------------- */
export function iniciarModalLogin() {
  const openModalBtn  = document.getElementById('openModalBtn');
  const loginModal    = document.getElementById('loginModal');
  const closeModalBtn = document.getElementById('closeModalBtn');

  if (!(openModalBtn && loginModal && closeModalBtn)) return;

  openModalBtn.addEventListener('click', () => {
    loginModal.style.display = 'flex';
  });

  closeModalBtn.addEventListener('click', () => {
    loginModal.style.display = 'none';
  });

  window.addEventListener('click', (e) => {
    if (e.target === loginModal) loginModal.style.display = 'none';
  });
}

/* ----------------------------------------------------------------------
   Toggle del menú lateral de categorías con cierre “clic‑afuera”
   ---------------------------------------------------------------------- */
let outsideClickListener = null;          // referencia al listener global

export function toggleCategorias() {
  const contenedor = document.getElementById('categorias');
  if (!contenedor) {
    console.error('No se encontró el contenedor de categorías.');
    return;
  }

  const abierto = contenedor.classList.toggle('mostrar'); // abre / cierra

  /* ---------- al abrir: activar el listener de clic‑afuera ------------ */
  if (abierto) {
    outsideClickListener = (e) => {
      /* ignora clics dentro del menú o sobre el botón hamburguesa */
      if (contenedor.contains(e.target) || e.target.closest('.menu-toggle')) {
        return;
      }
      contenedor.classList.remove('mostrar');          // cierra menú
      document.removeEventListener('click', outsideClickListener);
      outsideClickListener = null;
    };

    /* diferimos 1 tick para no capturar el clic que lo abrió */
    setTimeout(() => document.addEventListener('click', outsideClickListener), 0);
  } else if (outsideClickListener) {
    document.removeEventListener('click', outsideClickListener);
    outsideClickListener = null;
  }
}

/* disponible desde HTML inline */
window.toggleCategorias = toggleCategorias;

/* ----------------------------------------------------------------------
   Ocultar explícitamente el menú hamburguesa (por si lo necesitas)
   ---------------------------------------------------------------------- */
export function ocultarMenuHamburguesa() {
  const contenedor = document.getElementById('categorias');
  if (contenedor) contenedor.classList.remove('mostrar');
}

/* ----------------------------------------------------------------------
   Scroll con flechas en la barra de categorías
   ---------------------------------------------------------------------- */
export function iniciarScrollCategorias() {
  const scrollContainer = document.querySelector('.categorias');
  const leftArrow       = document.querySelector('.flecha-izquierda');
  const rightArrow      = document.querySelector('.flecha-derecha');

  if (!(scrollContainer && leftArrow && rightArrow)) return;

  /* configuración — ajusta si tus clases cambian */
  const categoriaSelector  = '.categoria';       // cada botón de categoría
  const menuToggleSelector = '.menu-toggle';     // botón hamburguesa

  /* ------- desplazamiento mediante flechas ---------- */
  const step = 150; // px por clic

  leftArrow .addEventListener('click', () => scrollContainer.scrollBy({ left: -step, behavior: 'smooth' }));
  rightArrow.addEventListener('click', () => scrollContainer.scrollBy({ left:  step, behavior: 'smooth' }));

  /* mostrar / ocultar flechas según posición */
  const updateArrows = () => {
    leftArrow .style.display = scrollContainer.scrollLeft > 0                       ? 'block' : 'none';
    rightArrow.style.display = scrollContainer.scrollLeft < (scrollContainer.scrollWidth - scrollContainer.clientWidth - 1)
                                                                          ? 'block' : 'none';
  };
  scrollContainer.addEventListener('scroll', updateArrows);
  window.addEventListener('resize', updateArrows);
  updateArrows();           // estado inicial

  /* cerrar menú hamburguesa al pulsar una categoría */
  scrollContainer.addEventListener('click', (e) => {
    if (e.target.closest(categoriaSelector)) {
      ocultarMenuHamburguesa();
    }
  });
}

/* ----------------------------------------------------------------------
   Inicialización automática al cargar el DOM
   ---------------------------------------------------------------------- */
document.addEventListener('DOMContentLoaded', () => {
  iniciarModalLogin();
  iniciarScrollCategorias();
  ocultarMenuHamburguesa();   // asegúrate de que arranca cerrado
});

/* ----------------------------------------------------------------------
   Fin del módulo
   ---------------------------------------------------------------------- */
