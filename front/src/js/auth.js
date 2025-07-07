// src/js/auth.js

// Obtener el valor de una cookie por nombre
function obtenerCookie(nombre) {
  const name = nombre + "=";
  const decodedCookie = decodeURIComponent(document.cookie);
  const ca = decodedCookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i].trim();
    if (c.indexOf(name) === 0) {
      return c.substring(name.length);
    }
  }
  return null;
}

// Verificar autenticación básica mediante cookie
function verificarAutenticacionSimple() {}

// Ejecutar la verificación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  verificarAutenticacionSimple();
});
