

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
export function iniciarScrollCategorias() {
  const scrollContainer = document.querySelector('.categorias');
  const leftArrow = document.querySelector('.flecha-izquierda');
  const rightArrow = document.querySelector('.flecha-derecha');

  if (!scrollContainer || !leftArrow || !rightArrow) return;

  function actualizarVisibilidadFlechas() {
    const scrollWidth = scrollContainer.scrollWidth;
    const clientWidth = scrollContainer.clientWidth;
    const scrollLeft = scrollContainer.scrollLeft;

    const hayOverflow = scrollWidth > clientWidth;

    leftArrow.style.display = (hayOverflow && scrollLeft > 0) ? 'block' : 'none';
    rightArrow.style.display = (hayOverflow && scrollLeft + clientWidth < scrollWidth - 1) ? 'block' : 'none';
  }

  scrollContainer.addEventListener('scroll', actualizarVisibilidadFlechas);
  window.addEventListener('resize', actualizarVisibilidadFlechas);

  leftArrow.addEventListener('click', () => {
    scrollContainer.scrollBy({ left: -150, behavior: 'smooth' });
  });

  rightArrow.addEventListener('click', () => {
    scrollContainer.scrollBy({ left: 150, behavior: 'smooth' });
  });

  actualizarVisibilidadFlechas();
}

// Inicializar todo al cargar el DOM
document.addEventListener('DOMContentLoaded', () => {
  iniciarModalLogin();
  iniciarScrollCategorias();
});
