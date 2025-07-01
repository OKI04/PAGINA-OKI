const salir = document.getElementById("logout");
salir.addEventListener('click', async () => {

    console.log("Saliendo");

    try {

        const res = await fetch('/admin/logout', {
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