function verificarAutenticacionSimple() {
  // Obtiene el token de autenticación desde las cookies
  const token = obtenerCookie('token');

  // Si no hay token, se redirige al usuario a la página de login
  if (!token) {
    window.location.href = '/login';  // Redirecciona
    return false;                     // Retorna false porque no está autenticado
  }

  // Si hay token, la verificación es exitosa
  return true;
}

function obtenerCookie(nombre) {
  // Construye el prefijo que identifica la cookie
  const name = nombre + "=";

  // Decodifica todas las cookies del documento
  const decodedCookie = decodeURIComponent(document.cookie);

  // Divide las cookies en partes individuales por el punto y coma
  const ca = decodedCookie.split(';');

  // Recorre todas las cookies
  for(let i = 0; i < ca.length; i++) {
    let c = ca[i];

    // Elimina espacios en blanco iniciales
    while (c.charAt(0) === ' ') {
      c = c.substring(1);
    }

    // Si encuentra la cookie con el nombre indicado, devuelve su valor
    if (c.indexOf(name) === 0) {
      return c.substring(name.length, c.length);
    }
  }

  // Si no encuentra la cookie, devuelve null
  return null;
}

// Ejecutar la verificación al cargar la página
if (!verificarAutenticacionSimple()) {
  // Si la verificación falla, ya se redirigió.
}
