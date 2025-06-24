let formularioId = 0;
const arrayList = [];

function carruselItemTemplate(index) {
  const formContainer = document.getElementById('formContainer');
  const div = document.createElement('div');
  div.className = 'col-md-4 mb-3'; // 3 columnas por fila
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
          <select name="categoria" id="categoriaSelect" class="form-control tipo" required aria-placeholder="Selecciona   una   categoría">
          <option value="colores">Colores</option>
          <option value="estampados">Estampados</option>
          </select>
        </div>
  
        <div>
          <label class="form-label">Código</label>
          <input type="text" class="form-control codigo">
        </div>
      </div>
    </div>
  `;
  formContainer.appendChild(div);
  return div;
}

async function guardarDatos() {

    arrayList.length = 0;

    const formularios = document.querySelectorAll('#formContainer > div');
    let hayError = false;

    formularios.forEach((formDiv, index) => {
      const referencia = formDiv.querySelector('.referencia').value.trim();
      const tipo = formDiv.querySelector('.tipo').value;
      const codigo = formDiv.querySelector('.codigo').value.trim();


      if (referencia === '' || tipo === '' || codigo === '') {
        alert(`Los campos en el formulario ${index + 1} es obligatorio.`);
        hayError = true;
        return;
      }

      arrayList.push({ referencia, tipo, codigo });
    });

    if (!hayError) {

      try {
        console.log("Enviando al backend:", arrayList);
        const productos = arrayList;

        // Enviar al backend
        const res = await fetch('/admin/carrusel/products/create/item', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({productos}),
          credentials: 'include'
        });

        if (!res.ok) {
          const err = await res.json();
          alert("error");
          console.log('Error al crear el carrusel: ' + (err.message || res.statusText));
          return;
        }

        const nuevoCarrusel = await res.json();
        console.log('Creado:', nuevoCarrusel);


      } catch (error) {
        console.error('Error en fetch crear el carrusel: ', error);
        alert('Error de conexión al crear el carrusel');
      }
      
    }
}

function limpiarFormularios() {
    document.getElementById('formContainer').innerHTML = '';
    formularioId = 0;
}

function eliminarFormulario(id) {
  const formDiv = document.getElementById(`form-${id}`);
  if (formDiv) {
    formDiv.remove();
  }
}
