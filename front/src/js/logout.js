// src/js/logout.js

document.addEventListener('DOMContentLoaded', () => {
  const salir = document.getElementById("logout");
  
  if (salir) {
    salir.addEventListener('click', async () => {
      console.log("Saliendo");

      try {
        const res = await fetch('/admin/logout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include'
        });

        if (!res.ok) {
          const err = await res.json();
          console.log(err);
          return;
        }

        console.log(res);
        window.location.href = '/index.html'; // Usa ruta absoluta si estás usando Vite

      } catch (err) {
        console.error('Error en fetch logout:', err);
      }
    });
  } else {
    console.warn('Botón de logout no encontrado');
  }
});
