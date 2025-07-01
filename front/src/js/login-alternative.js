// Versión alternativa del login que usa localStorage en lugar de cookies
// 1. Referencias al formulario y al contenedor de error
const form = document.getElementById('loginForm');
const errorMsg = document.getElementById('errorMsg');

// 2. Escucha el evento submit
form.addEventListener('submit', async event => {
  event.preventDefault();               // evita recarga automática

  // 3. Toma los valores de los campos
  const email = form.email.value;
  const password = form.password.value;

  console.log('Intentando login con:', { email, password: '***' });
  console.log('Entorno detectado:', location.hostname);

  // Limpiar mensaje de error previo
  errorMsg.style.display = 'none';

  // Determinar la URL base según el entorno
  const baseUrl = location.hostname === 'localhost' 
    ? '' // En desarrollo local, usar proxy de Vite
    : 'https://pagina-back-oki.onrender.com'; // En producción, usar URL directa

  const loginUrl = `${baseUrl}/admin/login`;

  try {
    // 4. Llama al endpoint de login
    console.log('Enviando petición a:', loginUrl);
    const res = await fetch(loginUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
      credentials: 'include'            // si usas cookies
    });

    console.log('Respuesta recibida:', res.status, res.statusText);

    // 5. Si no es 200–299, muestra error
    if (!res.ok) {
      const err = await res.json();
      console.error('Error de login:', err);
      errorMsg.textContent = err.message || 'Credenciales inválidas';
      errorMsg.style.display = 'block';
      return;
    }

    const data = await res.json();
    console.log('Login exitoso:', data);

    // 6. Guardar información de usuario en localStorage INMEDIATAMENTE
    if (data.user) {
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('loginTime', Date.now().toString());
      console.log('Usuario guardado en localStorage:', data.user);
      console.log('Verificando localStorage:', {
        user: localStorage.getItem('user'),
        loginTime: localStorage.getItem('loginTime')
      });
    } else {
      console.warn('⚠️ No se recibió información de usuario en la respuesta');
    }

    // 7. Verificar que las cookies se establecieron correctamente
    const cookies = document.cookie;
    console.log('Cookies después del login:', cookies);
    
    // Si no hay cookies, mostrar advertencia pero continuar
    if (!cookies.includes('token=')) {
      console.warn('⚠️ No se detectó cookie de token, usando localStorage como respaldo');
    }
    
    // 8. Redirigir al dashboard INMEDIATAMENTE (sin setTimeout)
    console.log('Redirigiendo al dashboard...');
    window.location.href = '/dashboardAdmin.html';

  } catch (err) {
    console.error('Error en fetch login:', err);
    errorMsg.textContent = 'Error de conexión: ' + err.message;
    errorMsg.style.display = 'block';
  }
});


 