// 1. Referencias al formulario y al contenedor de error
const form = document.getElementById('loginForm');
const errorMsg = document.getElementById('errorMsg');

// 2. Escucha el evento submit
form.addEventListener('submit', async event => {
  event.preventDefault();               // evita recarga automática

  // 3. Toma los valores de los campos
  const email = form.email.value;
  const password = form.password.value;

  try {
    // 4. Llama al endpoint de login
    const res = await fetch('/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
      credentials: 'include'            // si usas cookies
    });

    // 5. Si no es 200–299, muestra error
    if (!res.ok) {
      const err = await res.json();
      errorMsg.textContent = err.message || 'Credenciales inválidas';
      errorMsg.style.display = 'block';
      return;
    }

    // 6. Si fue exitoso, guarda el token y redirige al dashboard
    let data = {};
    try {
      const text = await res.text();
      data = text ? JSON.parse(text) : {};
    } catch (e) {
      errorMsg.textContent = 'Respuesta inesperada del servidor.';
      errorMsg.style.display = 'block';
      return;
    }
    if (data.token) {
      localStorage.setItem('token', data.token);
    }
    window.location.href = '/dashboardAdmin.html';

  } catch (err) {
    console.error('Error en fetch login:', err);
    errorMsg.textContent = 'Error de conexión';
    errorMsg.style.display = 'block';
  }
});