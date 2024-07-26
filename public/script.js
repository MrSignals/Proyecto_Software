document.addEventListener("DOMContentLoaded", () => {
  // Llama a la función para cargar datos de usuarios
  cargarDatos("/usuarios", "resultado-usuarios", ["Nombre", "Tipo"]);
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
