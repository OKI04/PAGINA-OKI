const form = document.getElementById('loginForm');
const errorMsg = document.getElementById('errorMsg');
const submitBtn = form.querySelector('button[type="submit"]');

form.addEventListener('submit', async event => {
  event.preventDefault();

  const email = form.email.value;
  const password = form.password.value;

  errorMsg.style.display = 'none';
  submitBtn.disabled = true;

  try {
    const res = await fetch('/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
      credentials: 'include'
    });

    if (!res.ok) {
      const err = await res.json();
      errorMsg.textContent = err.message || 'Credenciales inválidas';
      errorMsg.style.display = 'block';
      submitBtn.disabled = false;
      return;
    }

    window.location.href = 'dashboardAdmin.html';

  } catch (err) {
    console.error('Error en fetch login:', err);
    errorMsg.textContent = 'Error de conexión';
    errorMsg.style.display = 'block';
    submitBtn.disabled = false;
  }
});
