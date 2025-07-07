const salir = document.getElementById("logout");
salir.addEventListener('click', async () => {
const baseApiUrl = location.hostname === 'localhost'
  ? ''
  : 'https://pagina-back-oki.onrender.com';


    console.log("Saliendo");

    try {

        const res = await fetch(`${baseApiUrl}/admin/logout`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include'
        })

        if (!res.ok) {
            const err = await res.json();
            console.log(err);
            return;
        }
        console.log(res);
        window.location.href = 'index.html';

    } catch (err) {
        console.error('Error en fetch login:', err);
    }
})