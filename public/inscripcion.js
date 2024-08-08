const usuarioJuan = {
  Nombre: "Juan",
  Apellido: "Pérez",
  Email: "juan.perez@example.com",
  Edad: 20,
  Sexo: "M",
  Tipo: "Estudiante",
  Escuela: "Ingeniería de Sistemas",
  Creditos: 85,
  Nivel: 3,
  MaxCreditos: 15,
  Malla: "Sistemas de Informacion 2019",
  CreditosAprobados: 15,
  Periodo: "2024",
};

document
  .querySelector(".header--button-print")
  .addEventListener("click", () => {
    // URL del endpoint para generar el PDF
    const pdfUrl = "/generar-pdf";

    // Redirige al usuario a la URL del PDF
    window.location.href = pdfUrl;
  });

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
  document.getElementById("creditos_aprobados").value =
    usuario.CreditosAprobados;
  document.getElementById("periodo").value = usuario.Periodo;
}

document.addEventListener("DOMContentLoaded", () => {
  mostrarDatos(usuarioJuan);

  function obtenerDatosEstudiante() {
    fetch("/matriculas")
      .then((response) => response.json())
      .then((data) => {
        if (data.length === 0) {
          console.error("No se encontraron datos para el estudiante");
          return;
        }

        // Mostrar las materias seleccionadas
        const tableBody = document.querySelector(
          "#selected-materias-table tbody"
        );
        data.forEach((item) => {
          const row = document.createElement("tr");
          row.innerHTML = `
            <td>${item.Asignatura_Curso}</td>
            <td>${item.Paralelo_Curso}</td>
            <td>${item.Creditos_Curso}</td>
          `;
          tableBody.appendChild(row);
        });
      })
      .catch((error) => console.error("Error fetching data:", error));
  }
  obtenerDatosEstudiante();
});
