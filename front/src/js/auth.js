async function verificarAutenticacionSimple() {
  // Obtiene el token de autenticación desde las cookies
  const token = obtenerCookie('token');

  // Si no hay token, se redirige al usuario a la página de login
  if (!token) {
    console.log('No se encontró token de autenticación');
    window.location.href = '/index.html';  // Redirecciona al index donde está el modal de login
    return false;                     // Retorna false porque no está autenticado
  }

  // Verificar si el token es válido haciendo una petición al servidor
  try {
    // Determinar la URL base según el entorno
    const baseUrl = location.hostname === 'localhost' 
      ? '' // En desarrollo local, usar proxy de Vite
      : 'https://pagina-back-oki.onrender.com'; // En producción, usar URL directa

    const response = await fetch(`${baseUrl}/admin/verify`, {
      method: 'GET',
      credentials: 'include'
    });

    if (!response.ok) {
      console.log('Token inválido o expirado');
      // Token inválido, limpiar cookie y redirigir
      document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      window.location.href = '/index.html';
      return false;
    }

    const data = await response.json();
    console.log('Autenticación verificada para usuario:', data.user.username);
    return true;
  } catch (error) {
    console.error('Error al verificar autenticación:', error);
    window.location.href = '/index.html';
    return false;
  }
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
document.addEventListener('DOMContentLoaded', async () => {
  const isAuthenticated = await verificarAutenticacionSimple();
  if (!isAuthenticated) {
    // Si la verificación falla, ya se redirigió.
    console.log('Usuario no autenticado, redirigiendo...');
  }
});
