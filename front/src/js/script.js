

// Llenar opciones en un select
export function llenarSelect(id, opciones) {
  const select = document.getElementById(id);
  if (!select) return;
  select.innerHTML = "";
  opciones.forEach(opcion => {
    const opt = document.createElement("option");
    opt.value = opcion;
    opt.textContent = opcion;
    select.appendChild(opt);
  });
}

// Modal de inicio de sesión
export function iniciarModalLogin() {
  const openModalBtn = document.getElementById('openModalBtn');
  const loginModal = document.getElementById('loginModal');
  const closeModalBtn = document.getElementById('closeModalBtn');

  if (openModalBtn && loginModal && closeModalBtn) {
    openModalBtn.addEventListener('click', () => {
      loginModal.style.display = 'flex';
    });

    closeModalBtn.addEventListener('click', () => {
      loginModal.style.display = 'none';
    });

    window.addEventListener('click', (event) => {
      if (event.target === loginModal) {
        loginModal.style.display = 'none';
      }
    });
  }
}
// Mostrar/ocultar categorías
export function toggleCategorias() {
  const elContenedor = document.getElementById('categorias');
  if (elContenedor) {
    elContenedor.classList.toggle('mostrar');
  } else {
    console.error("No se encontró el contenedor de categorías.");
  }
}

// Hacerla accesible globalmente para el HTML
window.toggleCategorias = toggleCategorias;

// Flechas en scroll de categorías
// categoriasScroll.js  (versión resumida: solo añadimos el cierre del menú)
export function iniciarScrollCategorias () {
  const scrollContainer = document.querySelector('.categorias');
  const leftArrow      = document.querySelector('.flecha-izquierda');
  const rightArrow     = document.querySelector('.flecha-derecha');

  if (!scrollContainer || !leftArrow || !rightArrow) return;

  /*  ⬇️ 1)‑‑‑ Ajusta este selector a tu HTML ‑‑‑ */
  const categoriaSelector    = '.categoria';       // elemento que representa cada categoría
  const menuHamburguesaSel   = '.navbar-collapse'; // <‑ o el contenedor de tu menú lateral

  /* ---------- función para ocultar el menú hamburguesa ---------- */
  function ocultarMenuHamburguesa () {
    const menu = document.querySelector(menuHamburguesaSel);
    if (!menu) return;

    /*  OPCIÓN A – menú propio: simplemente quito la clase “open/show”  */
    menu.classList.remove('open', 'show');

    /*  OPCIÓN B – Navbar Collapse de Bootstrap 5:
        const bsCollapse = bootstrap.Collapse.getInstance(menu)
                         || new bootstrap.Collapse(menu, { toggle:false });
        bsCollapse.hide();
    */
  }

  /* ---------- clic en categoría: cierra flechas + menú ---------- */
  scrollContainer.addEventListener('click', (e) => {
    if (e.target.closest(categoriaSelector)) {
      leftArrow.style.display  = 'none';
      rightArrow.style.display = 'none';
      ocultarMenuHamburguesa();      // 🡆 aquí cerramos el menú hamburguesa
    }
  });

  /* …el resto del código (scroll, resize, flechas) se queda igual… */
}


// Inicializar todo al cargar el DOM
document.addEventListener('DOMContentLoaded', () => {
  iniciarModalLogin();
  iniciarScrollCategorias();
  ocultarMenuHamburguesa();

});
