document.addEventListener("DOMContentLoaded", () => {
  // Llama a la función para cargar datos de usuarios
  cargarDatos("/usuarios", "resultado-usuarios", ["Nombre", "Tipo"]);
});
// Datos simulados para Juan
const usuarioJuan = {
  Nombre: "Juan",
  Apellido: "Pérez",
  Email: "juan.perez@example.com",
  Edad: 20,
  Sexo: "M",
  Tipo: "Estudiante",
  Escuela: "Ingeniería de Sistemas",
  Creditos: 100,
  Nivel: 3,
  MaxCreditos: 120,
  Malla: "Plan 2023",
  CreditosAprobados: 90,
  Periodo: "2024A"
};

// Función para mostrar los datos en la tabla
function mostrarDatos(usuario) {
  const escuelaDropdown = document.getElementById("escuela");
  const option = document.createElement("option");
  option.text = usuario.Escuela;
  option.selected = true;
  escuelaDropdown.add(option);

  document.getElementById("nivel").value = usuario.Nivel;
  document.getElementById("creditos").value = usuario.Creditos;
  document.getElementById("max_creditos").value = usuario.MaxCreditos;
  document.getElementById("malla").value = usuario.Malla;
  document.getElementById("creditos_aprobados").value = usuario.CreditosAprobados;
  document.getElementById("periodo").value = usuario.Periodo;
}

// Llamar a la función para mostrar los datos de Juan
document.addEventListener("DOMContentLoaded", function() {
  mostrarDatos(usuarioJuan);
});

function cargarDatos(endpoint, idResultado, campos) {
  fetch(endpoint)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Error en la solicitud: " + response.status);
      }
      return response.json();
    })
    .then((data) => {
      const resultadoDiv = document.getElementById(idResultado);
      if (Array.isArray(data) && data.length > 0) {
        let lista;
        if (Array.isArray(campos)) {
          // Si campos es un array, mapea cada item usando todos los campos
          lista = data
            .map(
              (item) =>
                `<li>${item[campos[0]] || "Dato no disponible"} (${
                  item[campos[1]] || "Tipo no disponible"
                })</li>`
            )
            .join("");
        } else {
          // Si campos es una cadena, mapea cada item usando el campo único
          lista = data
            .map((item) => `<li>${item[campos] || "Dato no disponible"}</li>`)
            .join("");
        }
        resultadoDiv.innerHTML = `<ul>${lista}</ul>`;
      } else {
        resultadoDiv.innerHTML = "No se encontraron datos.";
      }
    })
    .catch((error) => {
      const resultadoDiv = document.getElementById(idResultado);
      resultadoDiv.innerHTML = "Error al cargar los datos.";
    });
}
