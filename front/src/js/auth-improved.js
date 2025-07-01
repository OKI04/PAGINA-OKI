// Versión mejorada de autenticación que maneja tanto cookies como localStorage

async function verificarAutenticacionMejorada() {
  console.log('🔍 Iniciando verificación de autenticación mejorada...');
  
  // 1. Verificar cookies primero
  const token = obtenerCookie('token');
  console.log('🍪 Token en cookies:', token ? 'SÍ' : 'NO');
  
  // 2. Verificar localStorage como respaldo
  const userInfo = localStorage.getItem('user');
  const loginTime = localStorage.getItem('loginTime');
  console.log('💾 Info en localStorage:', userInfo ? 'SÍ' : 'NO');
  
  // 3. Si no hay ninguna información de autenticación
  if (!token && !userInfo) {
    console.log('❌ No hay información de autenticación');
    window.location.href = '/index.html';
    return false;
  }
  
  // 4. Si hay información en localStorage, verificar si no ha expirado (24 horas)
  if (userInfo && loginTime) {
    const now = Date.now();
    const loginTimestamp = parseInt(loginTime);
    const hoursElapsed = (now - loginTimestamp) / (1000 * 60 * 60);
    
    console.log(`⏰ Horas desde el login: ${hoursElapsed.toFixed(2)}`);
    
    if (hoursElapsed > 24) {
      console.log('⏰ Sesión expirada (más de 24 horas)');
      localStorage.removeItem('user');
      localStorage.removeItem('loginTime');
      window.location.href = '/index.html';
      return false;
    }
  }
  
  // 5. Intentar verificar con el servidor si hay token
  if (token) {
    try {
      const baseUrl = location.hostname === 'localhost' 
        ? '' 
        : 'https://pagina-back-oki.onrender.com';

      const response = await fetch(`${baseUrl}/admin/verify`, {
        method: 'GET',
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Verificación con servidor exitosa:', data.user.username);
        
        // Actualizar localStorage con información fresca
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('loginTime', Date.now().toString());
        
        return true;
      } else {
        console.log('❌ Token inválido en servidor');
        // Limpiar cookie inválida
        document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      }
    } catch (error) {
      console.error('💥 Error al verificar con servidor:', error);
    }
  }
  
  // 6. Si llegamos aquí, usar localStorage como respaldo
  if (userInfo) {
    try {
      const user = JSON.parse(userInfo);
      console.log('✅ Usando autenticación desde localStorage:', user.username);
      return true;
    } catch (error) {
      console.error('💥 Error al parsear usuario de localStorage:', error);
      localStorage.removeItem('user');
      localStorage.removeItem('loginTime');
    }
  }
  
  // 7. Si todo falla, redirigir al login
  console.log('❌ Todas las verificaciones fallaron');
  window.location.href = '/index.html';
  return false;
}

function obtenerCookie(nombre) {
  const name = nombre + "=";
  const decodedCookie = decodeURIComponent(document.cookie);
  const ca = decodedCookie.split(';');
  for(let i = 0; i < ca.length; i++) {
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

// Ejecutar la verificación al cargar la página
document.addEventListener('DOMContentLoaded', async () => {
  const isAuthenticated = await verificarAutenticacionMejorada();
  if (!isAuthenticated) {
    console.log('Usuario no autenticado, redirigiendo...');
  } else {
    console.log('✅ Usuario autenticado correctamente');
  }
});

// Exponer función globalmente para debugging
window.verificarAuth = verificarAutenticacionMejorada;