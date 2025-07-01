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
   
    // 6. Si fue exitoso, redirige al dashboard
    console.log('Redirigiendo al dashboard...');
    window.location.href = 'dashboardAdmin.html';

  } catch (err) {
    console.error('Error en fetch login:', err);
    errorMsg.textContent = 'Error de conexión: ' + err.message;
    errorMsg.style.display = 'block';
  }
});


 