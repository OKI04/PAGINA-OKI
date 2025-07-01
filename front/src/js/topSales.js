// topSales.js — versión ES Module SIN dependencias externas
// Carga este archivo con:
//   <script type="module" src="src/js/topSales.js"></script>
// y funcionará de forma autónoma.

let formularioId = 0;
const arrayList = [];

const baseApiUrl = location.hostname === 'localhost'
  ? ''
  : 'https://pagina-back-oki.onrender.com';

/**
 * Inserta un nuevo formulario/card en #formContainer.
 * @param {number} index  Índice consecutivo para el botón de cierre.
 */
export function carruselItemTemplate(index) {
  const formContainer = document.getElementById('formContainer');
  const div = document.createElement('div');
  div.className = 'col-md-4 mb-3';
  div.innerHTML = `
    <div class="card position-relative border p-2 pt-4 rounded bg-light divItemsCarrusel" id="form-${formularioId}">
      <button type="button" class="btn-close position-absolute top-0 end-0 m-2" 
              data-index="${index}" aria-label="Cerrar"></button>
      <div class="card-body">
        <div class="mb-2">
          <label class="form-label ref">Referencia*</label>
          <input type="text" class="form-control referencia" required>
        </div>
        <div class="md-2">
          <label class="form-label">Tipo*</label>
          <select name="categoria" class="form-control tipo" required>
            <option value="colores">Colores</option>
            <option value="estampados">Estampados</option>
          </select>
        </div>
        <div>
          <label class="form-label">Código</label>
          <input type="text" class="form-control codigo">
        </div>
      </div>
    </div>`;
  formContainer.appendChild(div);
  formularioId++;

  div.querySelector('.btn-close').addEventListener('click', () => div.remove());
  return div;
}

/**
 * Añade un ítem al contenedor usando la plantilla.
 * @param {string} containerId  ID del contenedor de formularios.
 * @param {Function} templateFn  Función que crea el ítem.
 */
function agregarItem(containerId, templateFn) {
  const container = document.getElementById(containerId);
  const index = container.children.length;
  templateFn(index);
}

/**
 * Valida los formularios y envía al backend.
 */
export async function guardarDatos() {
  arrayList.length = 0;
  const formularios = document.querySelectorAll('#formContainer > div');
  let hayError = false;

  formularios.forEach((formDiv, index) => {
    const referencia = formDiv.querySelector('.referencia').value.trim();
    const tipo = formDiv.querySelector('.tipo').value;
    const codigo = formDiv.querySelector('.codigo').value.trim();

    if (!referencia || !tipo || !codigo) {
      alert(`Los campos en el formulario ${index + 1} son obligatorios.`);
      hayError = true;
      return;
    }

    arrayList.push({ referencia, tipo, codigo });
  });

  if (hayError) return;

  try {
    const res = await fetch(`${baseApiUrl}/admin/carrusel/products/create/item`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productos: arrayList }),
      credentials: 'include'
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || res.statusText);
    }

    const nuevoCarrusel = await res.json();
    console.log('Creado:', nuevoCarrusel);
  } catch (error) {
    console.error('Error en fetch crear el carrusel: ', error);
    alert('Error de conexión al crear el carrusel');
  }
}

export function limpiarFormularios() {
  document.getElementById('formContainer').innerHTML = '';
  formularioId = 0;
}

export function eliminarFormulario(id) {
  const formDiv = document.getElementById(`form-${id}`);
  if (formDiv) formDiv.remove();
}

/**
 * Inicializa el módulo: conecta el botón "Añadir" cuando el DOM esté listo.
 */
export function initTopSalesModule() {
  document.getElementById('addCarruselItemBtn')?.addEventListener('click', () =>
    agregarItem('formContainer', carruselItemTemplate)
  );
}

// Auto‑init cuando el DOM está listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initTopSalesModule);
} else {
  initTopSalesModule();
}
