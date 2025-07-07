// archivo.js
// -----------------------------
// CONFIGURACIONES PARA TYPE=MODULE
// -----------------------------
export {
  AgregarCarro,
  cerrarModal,
  eliminarItem,
  toggleCarrito,
  Contizacion,
  cerrarCotizacion,
  enviarCotizacion
};

window.AgregarCarro = AgregarCarro;
window.cerrarModal = cerrarModal;
window.eliminarItem = eliminarItem;
window.toggleCarrito = toggleCarrito;
window.Contizacion = Contizacion;
window.cerrarCotizacion = cerrarCotizacion;
window.enviarCotizacion = enviarCotizacion;

// -----------------------------
window.addEventListener("click", function(event) {
  const modalError = document.getElementById("modalError");
  const modalConfirmacion = document.getElementById('modalConfirmacion');
  const modalProducto = document.getElementById('modalProducto');
  const modalCarrito = document.getElementById("modalCarrito");

  if (event.target === modalError) modalError.style.display = "none";
  if (event.target === modalConfirmacion) cerrarModal();
  if (event.target === modalProducto) modalProducto.style.display = 'none';
  if (event.target === modalCarrito) modalCarrito.style.display = "none";
});

// -----------------------------
function toggleCarrito() {
  const modal = document.getElementById("modalCarrito");
  modal.classList.toggle("show");
  renderCarrito();
}

// -----------------------------
let carrito = [];

// -----------------------------
function AgregarCarro() {
  const nombre = document.getElementById("modal-nombre").textContent;
  const colorSeleccionado = document.querySelector('.color-option.selected');
  const estampadoSeleccionado = document.querySelector('.estampado-option.selected');
  const tallaSeleccionada = document.querySelector('.talla-btn.selected');

  const colorCodigo = colorSeleccionado?.title || null;
  const colorNombre = colorSeleccionado?.alt || 'Sin seleccionar';

  const estampadoCodigo = estampadoSeleccionado?.title || null;
  const estampadoNombre = estampadoSeleccionado?.alt || 'Sin seleccionar';

  const talla = tallaSeleccionada ? tallaSeleccionada.textContent : null;
  const cantidad = parseInt(document.getElementById("cantidad").textContent);

  if (!talla) return mostrarErrorModal("Por favor selecciona una talla antes de continuar.");
  if (isNaN(cantidad) || cantidad < 1) return mostrarErrorModal("Por favor ingresa una cantidad válida.");

  const precio = parseInt(document.getElementById("modal-precio").textContent.replace(/[^\d]/g, ''));
  const total = precio * cantidad;

  const referencia = document.getElementById("modal-referencia").textContent;
  const producto = productosCargados.find(p => p.referencia === referencia);

  let imagenProducto = "src/Imagen_De_Apoyo/producto.png";
  if (estampadoCodigo && producto?.estampados) {
    const est = producto.estampados.find(e => e.codigo === estampadoCodigo);
    imagenProducto = est?.imagenes?.[1]?.publicUrl || est?.imagenes?.[0]?.publicUrl || imagenProducto;
  } else if (colorCodigo && producto?.colores) {
    const col = producto.colores.find(c => c.codigo === colorCodigo);
    imagenProducto = col?.imagenes?.[1]?.publicUrl || col?.imagenes?.[0]?.publicUrl || imagenProducto;
  } else if (producto?.imagenes?.length) {
    imagenProducto = producto.imagenes?.[1]?.publicUrl || producto.imagenes?.[0]?.publicUrl;
  }

  carrito.push({
    nombre, referencia, color: colorNombre, colorCodigo,
    estampado: estampadoNombre, estampadoCodigo,
    talla, cantidad, precio, total, imagen: imagenProducto
  });

  actualizarContadorCarrito();
  if (document.getElementById("modalCarrito").classList.contains("show")) renderCarrito();
  document.getElementById('modalConfirmacion').style.display = 'block';
}

// -----------------------------
function cerrarModal() {
  document.getElementById('modalConfirmacion').style.display = 'none';
}

// -----------------------------
function eliminarItem(index) {
  carrito.splice(index, 1);
  renderCarrito();
  actualizarContadorCarrito();
}

// -----------------------------
function renderCarrito() {
  const cartItems = document.getElementById("cart-items");
  const totalPago = document.getElementById("total-pago");

  cartItems.innerHTML = "";
  let total = 0;

  carrito.forEach((item, index) => {
    cartItems.innerHTML += `
      <div class="cart-item">
        <img src="${item.imagen}" alt="producto" class="cart-img" style="width: 80px;" />
        <div class="cart-item-info">
          <h3>${item.nombre}</h3>
          <p>Color: ${item.color !== 'Sin seleccionar' ? item.color : item.estampado}</p>
          <p>Talla: ${item.talla}</p>
          <p>Cantidad: ${item.cantidad} un.</p>
          <p class="cart-item-total">Total producto: $${item.total.toLocaleString("es-CO")}</p>
        </div>
        <button class="delete-item" onclick="eliminarItem(${index})">X</button>
      </div>`;
    total += item.total;
  });

  totalPago.textContent = total.toLocaleString("es-CO");
}

// -----------------------------
function actualizarContadorCarrito() {
  const contador = document.getElementById("cart-count");
  contador.textContent = carrito.length;
  contador.style.display = carrito.length > 0 ? "inline-block" : "none";
}

// -----------------------------
function mostrarErrorModal(mensaje) {
  document.getElementById("modalErrorMensaje").textContent = mensaje;
  document.getElementById("modalError").style.display = "flex";
}

function cerrarModalError() {
  document.getElementById("modalError").style.display = "none";
}

// -----------------------------
function Contizacion() {
  const modal = document.getElementById("modalCotizacion");
  const lista = modal.querySelector(".product-list");
  lista.innerHTML = "";

  if (carrito.length === 0) {
    lista.innerHTML = `<li class="product-item"><div class="product-info"><span>No hay productos en el carrito.</span></div></li>`;
  } else {
    carrito.forEach((item, index) => {
      lista.innerHTML += `
        <li class="product-item">
          <div class="product-info">
            <span class="product-info-main"><b>${item.nombre}</b> - Ref: ${item.referencia}</span>
            <span class="product-subtitle">
              ${item.color !== 'Sin seleccionar' ? `Color: ${item.color}` : `Estampado: ${item.estampado}`} |
              Talla: ${item.talla} | Cant: ${item.cantidad} | Precio: $${item.precio.toLocaleString("es-CO")} |
              <b>Total: $${item.total.toLocaleString("es-CO")}</b>
            </span>
          </div>
          <button class="remove-button" onclick="eliminarProductoCotizacion(${index})" aria-label="Eliminar producto">X</button>
        </li>`;
    });
  }

  actualizarTotalPagar();
  modal.style.display = "block";
}

// -----------------------------
function actualizarTotalPagar() {
  const total = carrito.reduce((sum, item) => sum + item.total, 0);
  document.getElementById("total-pagoFinal").textContent = total.toLocaleString("es-CO");
}

function eliminarProductoCotizacion(index) {
  carrito.splice(index, 1);
  renderCarrito();
  Contizacion();
  actualizarContadorCarrito();
}

function cerrarCotizacion() {
  document.getElementById("modalCotizacion").style.display = "none";
  limpiarFormularioCotizacion();
}

function limpiarFormularioCotizacion() {
  const form = document.querySelector("#modalCotizacion .quote-form");
  if (form) form.reset();
}

// -----------------------------
function enviarCotizacion() {
  if (carrito.length === 0) {
    alert("El carrito está vacío.");
    return;
  }

  const nombre = document.getElementById("nombre").value.trim();
  const empresa = document.getElementById("empresa").value.trim();
  const direccion = document.getElementById("direccion").value.trim();
  const telefono = document.getElementById("telefono").value.trim();
  const correo = document.getElementById("correo").value.trim();

  if (!nombre || !direccion || !telefono || !correo) {
    alert("Completa todos los campos.");
    return;
  }

  let mensaje = `📦 *COTIZACIÓN DE PRODUCTOS*\n\n`;
  mensaje += `👤 *Nombre:* ${nombre}\n`;
  mensaje += `🏢 *Empresa:* ${empresa}\n`;
  mensaje += `🏠 *Dirección:* ${direccion}\n`;
  mensaje += `📞 *Teléfono:* ${telefono}\n`;
  mensaje += `📧 *Correo:* ${correo}\n\n`;

  mensaje += `🛒 *Productos solicitados:*\n`;

  carrito.forEach((item, index) => {
    const colorOEstampado = item.color !== 'Sin seleccionar'
      ? `🎨 Color: ${item.color}`
      : `🖼️ Estampado: ${item.estampado}`;

    mensaje += `\n🔹 *Producto ${index + 1}*\n`;
    mensaje += `📌 Referencia: ${item.referencia}\n`;
    mensaje += `📦 Nombre: ${item.nombre}\n`;
    mensaje += `${colorOEstampado}\n`;
    mensaje += `📏 Talla: ${item.talla}\n`;
    mensaje += `🔢 Cantidad: ${item.cantidad}\n`;
    mensaje += `💵 Precio unitario: $${item.precio.toLocaleString("es-CO")}\n`;
    mensaje += `💰 Subtotal: $${item.total.toLocaleString("es-CO")}\n`;
  });

  const total = carrito.reduce((sum, item) => sum + item.total, 0);
  mensaje += `\n💵 *Total a pagar:* $${total.toLocaleString("es-CO")}`;

  const numero = "573227534241";
  const url = `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`;
  window.open(url, "_blank");

  carrito = [];
  renderCarrito();
  actualizarContadorCarrito();
  cerrarCotizacion();
}
