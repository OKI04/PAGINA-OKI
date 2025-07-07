// main.js (este será tu único archivo JavaScript, debe incluirse con type="module")

/**
 * Obtiene el valor de una cookie por nombre.
 * @param {string} nombre - Nombre de la cookie a buscar.
 * @returns {string|null} - Valor de la cookie o null si no se encuentra.
 */
function obtenerCookie(nombre) {
  const name = nombre + "=";
  const decodedCookie = decodeURIComponent(document.cookie);
  const ca = decodedCookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) === 0) {
      return c.substring(name.length, c.length);
    }
  }
  return null;
}

/**
 * Verifica si el usuario está autenticado revisando la existencia del token.
 * Si no está autenticado, redirige a la página de login.
 * @returns {boolean} - true si está autenticado, false si no.
 */
function verificarAutenticacionSimple() {
  const token = obtenerCookie('token');

  if (!token) {
    // No hay token, redirigir al login
    window.location.href = 'dashboardAdmin.html';
    return false;
  }

  return true;
}

// Ejecutar la verificación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  verificarAutenticacionSimple();
});
