// Script de diagnóstico para el login
console.log('🔍 Iniciando diagnóstico de login...');

// Función para verificar cookies
function verificarCookies() {
  console.log('🍪 Cookies actuales:', document.cookie);
  const token = obtenerCookie('token');
  console.log('🎫 Token encontrado:', token ? 'SÍ' : 'NO');
  if (token) {
    console.log('🎫 Token value:', token.substring(0, 20) + '...');
  }
}

// Función para obtener cookies
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

// Función para probar login
async function probarLogin() {
  console.log('🧪 Probando login...');
  
  const email = 'admin@oki.com';
  const password = 'admin123';
  
  // Determinar la URL base según el entorno
  const baseUrl = location.hostname === 'localhost' 
    ? '' 
    : 'https://pagina-back-oki.onrender.com';
  
  const loginUrl = `${baseUrl}/admin/login`;
  
  console.log('🌐 URL de login:', loginUrl);
  console.log('🌍 Entorno detectado:', location.hostname);
  
  try {
    console.log('📤 Enviando petición de login...');
    const res = await fetch(loginUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
      credentials: 'include'
    });

    console.log('📥 Respuesta recibida:', res.status, res.statusText);
    console.log('📥 Headers de respuesta:', [...res.headers.entries()]);

    if (!res.ok) {
      const err = await res.json();
      console.error('❌ Error de login:', err);
      return false;
    }

    const data = await res.json();
    console.log('✅ Login exitoso:', data);
    
    // Verificar cookies después del login
    setTimeout(() => {
      console.log('🔍 Verificando cookies después del login...');
      verificarCookies();
    }, 100);
    
    return true;
    
  } catch (err) {
    console.error('💥 Error en fetch login:', err);
    return false;
  }
}

// Función para probar verificación de token
async function probarVerificacion() {
  console.log('🔐 Probando verificación de token...');
  
  const baseUrl = location.hostname === 'localhost' 
    ? '' 
    : 'https://pagina-back-oki.onrender.com';
  
  const verifyUrl = `${baseUrl}/admin/verify`;
  
  console.log('🌐 URL de verificación:', verifyUrl);
  
  try {
    console.log('📤 Enviando petición de verificación...');
    const response = await fetch(verifyUrl, {
      method: 'GET',
      credentials: 'include'
    });

    console.log('📥 Respuesta de verificación:', response.status, response.statusText);
    console.log('📥 Headers de verificación:', [...response.headers.entries()]);

    if (!response.ok) {
      const err = await response.json();
      console.error('❌ Error de verificación:', err);
      return false;
    }

    const data = await response.json();
    console.log('✅ Verificación exitosa:', data);
    return true;
    
  } catch (error) {
    console.error('💥 Error en verificación:', error);
    return false;
  }
}

// Función para diagnóstico completo
async function diagnosticoCompleto() {
  console.log('🚀 Iniciando diagnóstico completo...');
  
  // 1. Verificar estado inicial
  console.log('1️⃣ Estado inicial:');
  verificarCookies();
  
  // 2. Probar login
  console.log('2️⃣ Probando login:');
  const loginExitoso = await probarLogin();
  
  if (!loginExitoso) {
    console.log('❌ Login falló, deteniendo diagnóstico');
    return;
  }
  
  // 3. Esperar un poco y verificar cookies
  await new Promise(resolve => setTimeout(resolve, 500));
  console.log('3️⃣ Estado después del login:');
  verificarCookies();
  
  // 4. Probar verificación
  console.log('4️⃣ Probando verificación:');
  const verificacionExitosa = await probarVerificacion();
  
  if (verificacionExitosa) {
    console.log('✅ Diagnóstico completo: TODO FUNCIONA CORRECTAMENTE');
  } else {
    console.log('❌ Diagnóstico completo: FALLA EN LA VERIFICACIÓN');
  }
}

// Exponer funciones globalmente para uso manual
window.debugLogin = {
  verificarCookies,
  probarLogin,
  probarVerificacion,
  diagnosticoCompleto
};

console.log('🔧 Funciones de diagnóstico disponibles:');
console.log('- debugLogin.verificarCookies()');
console.log('- debugLogin.probarLogin()');
console.log('- debugLogin.probarVerificacion()');
console.log('- debugLogin.diagnosticoCompleto()');