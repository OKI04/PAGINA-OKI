async function cargarYMostrarProductos() {
      const main   = document.querySelector("#producto .main-products");
      const loader = document.querySelector(".spanLoader");

      // Si por cualquier motivo no existen, avisa y sal.
      if (!main || !loader) {
        console.error("No se encontraron los nodos #producto .main-products o .spanLoader");
        return;
      }

      try {
        loader.style.display = "inline-block";      // Mostrar loader
        const resp = await fetch("https://pagina-back-oki.onrender.com/admin/products/all");

        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);

        const productos = await resp.json();
        main.innerHTML = "";                        // Limpiar

        if (!productos.length) {
          main.innerHTML = "<p>No hay productos disponibles.</p>";
          return;
        }

        productos.forEach(prod => {
          const img = (
              prod.colores?.[0]?.imagenes?.[0]   ||
              prod.estampados?.[0]?.imagenes?.[0]||
              prod.imagenes?.[0]                 ||
              "https://via.placeholder.com/150"
          );

          main.insertAdjacentHTML(
            "beforeend",
            `<div class="product-card">
               <img src="${img}" alt="${prod.nombre}" class="product-img">
               <h3 class="product-title">${prod.nombre}</h3>
               <p class="product-desc">${prod.descripcion || "Sin descripción"}</p>
             </div>`
          );
        });
      } catch (err) {
        console.error("Error al cargar productos:", err);
        main.innerHTML = "<p>Error al cargar productos.</p>";
      } finally {
        loader.style.display = "none";              // Ocultar loader
      }
    }

    // Ejecutar cuando todo el documento esté listo
    document.addEventListener("DOMContentLoaded", cargarYMostrarProductos);
  