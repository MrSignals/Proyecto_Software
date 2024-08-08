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

document.querySelector(".header--button").addEventListener("click", () => {
  guardarInscripcion();
});

// Función para mostrar los datos del usuario
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

// Llamar a la función para mostrar los datos de Juan
document.addEventListener("DOMContentLoaded", function () {
  mostrarDatos(usuarioJuan);

  // Obtener datos de materias y actualizar la tabla
  fetch("http://localhost:3000/materias")
    .then((response) => response.json())
    .then((data) => {
      updateTable(data);
    })
    .catch((error) => console.error("Error al obtener las materias:", error));
});

const maxCreditos = 15;
let creditosSeleccionados = 0;
const materiasSeleccionadas = [];
const horariosMaterias = {};

// Función para actualizar la tabla con los datos obtenidos
function updateTable(materias) {
  const tbody = document.querySelector("#materias-table tbody");
  tbody.innerHTML = "";

  materias.forEach((materia) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
                    <td>${materia.Asignatura}</td>
                    <td>${materia.Paralelo}</td>
                    <td>${materia.Creditos}</td>
                    <td>${materia.Paralelo}</td>
                    <td><button class="add-btn" data-id="${materia.ID_Curso}" data-creditos="${materia.Creditos}">Agregar</button></td>
                `;
    tbody.appendChild(tr);
  });

  document.querySelectorAll(".add-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      handleButtonClick(btn);
    });
  });
}

// Función para manejar el click en el botón de agregar
function handleButtonClick(button) {
  const creditos = parseInt(button.getAttribute("data-creditos"), 10);
  const idCurso = parseInt(button.getAttribute("data-id"), 10);
  const materiaNombre =
    button.parentElement.parentElement.querySelector(
      "td:first-child"
    ).textContent;
  const horario =
    button.parentElement.parentElement.querySelector(
      "td:nth-child(4)"
    ).textContent; // Obtener el horario

  const materia = {
    ID_Curso: idCurso,
    Asignatura: materiaNombre,
    Paralelo: button.parentElement.previousElementSibling.textContent,
    Creditos: creditos,
    Horario: horario,
  };

  if (button.classList.contains("selected")) {
    button.classList.remove("selected");
    removeMateria(materia);
  } else {
    if (creditosSeleccionados + creditos <= maxCreditos) {
      if (
        !horariosMaterias[materia.Asignatura] ||
        horariosMaterias[materia.Asignatura] === horario
      ) {
        button.classList.add("selected");
        creditosSeleccionados += creditos;
        addMateria(materia);
        horariosMaterias[materia.Asignatura] = horario; // Guardar el horario
      } else {
        alert("Ya has seleccionado otro horario para esta materia.");
      }
    } else {
      alert("No puedes seleccionar más de 15 créditos.");
    }
  }
}
// Función para agregar una materia seleccionada a la tabla de materias seleccionadas
function addMateria(materia) {
  materiasSeleccionadas.push(materia);
  updateSelectedTable();
}

// Función para eliminar una materia seleccionada de la tabla
function removeMateria(materia) {
  const index = materiasSeleccionadas.findIndex(
    (m) => m.ID_Curso === materia.ID_Curso
  );
  if (index !== -1) {
    // Restar los créditos antes de eliminar
    creditosSeleccionados -= materiasSeleccionadas[index].Creditos;
    materiasSeleccionadas.splice(index, 1);
    updateSelectedTable(); // Actualizar la tabla después de la eliminación
  }
}

document.querySelectorAll(".add-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    handleButtonClick(btn);
  });
});

// Función para actualizar la tabla de materias seleccionadas
function updateSelectedTable() {
  const tbody = document.querySelector("#selected-materias-table tbody");
  tbody.innerHTML = "";

  materiasSeleccionadas.forEach((materia) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
                    <td>${materia.Asignatura}</td>
                    <td>${materia.Paralelo}</td>
                    <td>${materia.Creditos}</td>
                    <td><button class="remove-btn" data-id="${materia.ID_Curso}">Eliminar</button></td>
                `;
    tbody.appendChild(tr);
  });
  document.querySelectorAll(".remove-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      handleRemoveButtonClick(btn);
    });
  });
}

// Función para manejar el click en el botón de eliminar
function handleRemoveButtonClick(button) {
  const idCurso = parseInt(button.getAttribute("data-id"), 10);
  const materia = materiasSeleccionadas.find((m) => m.ID_Curso === idCurso);
  if (materia) {
    removeMateria(materia);
  }
}
function guardarInscripcion() {
  // Datos de la inscripción
  const inscripcion = {
    usuario: {
      ID_Estudiante: 1,
      Nombre: usuarioJuan.Nombre,
      Apellido: usuarioJuan.Apellido,
      Email: usuarioJuan.Email,
      Edad: usuarioJuan.Edad,
      Sexo: usuarioJuan.Sexo,
      Tipo: usuarioJuan.Tipo,
      Escuela: usuarioJuan.Escuela,
      Creditos: usuarioJuan.Creditos,
      Nivel: usuarioJuan.Nivel,
      MaxCreditos: usuarioJuan.MaxCreditos,
      Malla: usuarioJuan.Malla,
      CreditosAprobados: usuarioJuan.CreditosAprobados,
      Periodo: usuarioJuan.Periodo,
    },
    materias: materiasSeleccionadas.map((materia) => ({
      ID_Curso: materia.ID_Curso,
      Asignatura: materia.Asignatura,
      Paralelo: materia.Paralelo,
      Creditos: materia.Creditos,
      Horario: materia.Horario,
    })),
    creditosSeleccionados: creditosSeleccionados,
  };

  // Realizar la solicitud POST para guardar la inscripción

  fetch("http://localhost:3000/inscripciones", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(inscripcion),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Error al guardar la inscripción");
      }
      return response.json();
    })
    .then((data) => {
      alert("Inscripción guardada exitosamente");
      // Aquí puedes realizar otras acciones, como redirigir al usuario o limpiar el formulario
    })
    .catch((error) => {
      console.error("Error:", error);
      alert("Hubo un problema al guardar la inscripción");
    });
}
