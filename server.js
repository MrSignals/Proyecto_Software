require("dotenv").config();
const express = require("express");
const mysql = require("mysql2");
const path = require("path");
const app = express();
const port = 3000;
const bodyParser = require("body-parser");
const PDFDocument = require("pdfkit");
const fs = require("fs");

// Configurar la conexión a la base de datos
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: "proyecto_fc",
});

db.connect((err) => {
  if (err) throw err;
  console.log("Conectado a la base de datos");
});

// Configurar el middleware para servir archivos estáticos (HTML, CSS, JS)
app.use(express.static("public"));
app.use(bodyParser.json());
app.use(express.json());

// Ruta para servir el archivo index.html
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/inscripcion", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "inscripcion.html"));
});

// Ruta para obtener datos de la base de datos
app.get("/usuarios", (req, res) => {
  const sql = "SELECT ID_Estudiante, Nombre, Tipo FROM Estudiantes";
  db.query(sql, (err, results) => {
    if (err) throw err;
    res.json(results);
  });
});

app.get("/materias", (req, res) => {
  const sql = "SELECT ID_Curso, Asignatura, Creditos, Paralelo FROM Cursos";
  db.query(sql, (err, results) => {
    if (err) throw err;
    res.json(results);
  });
});

// Ruta para manejar la inscripción de materias
app.post("/inscripciones", async (req, res) => {
  const { usuario, materias, creditosSeleccionados } = req.body;

  // Asegúrate de que `usuario` y `materias` están presentes en la solicitud
  if (!usuario || !materias || !Array.isArray(materias)) {
    return res.status(400).json({ message: "Datos de inscripción inválidos" });
  }

  // Verifica si el usuario tiene suficiente crédito para las materias seleccionadas
  if (creditosSeleccionados > usuario.MaxCreditos) {
    return res
      .status(400)
      .json({ message: "Exceso de créditos seleccionados" });
  }

  try {
    // Verifica choques de horarios
    const choques = await verificarChoquesHorarios(
      usuario.ID_Estudiante,
      materias
    );
    if (choques.length > 0) {
      return res.status(400).json({ message: "Choque de horarios detectado" });
    }

    // Insertar las materias en la base de datos
    const sql = "INSERT INTO Matriculas (ID_Curso, ID_Estudiante) VALUES ?";
    const values = materias.map((materia) => [
      materia.ID_Curso,
      usuario.ID_Estudiante,
    ]);

    db.query(sql, [values], (err, results) => {
      if (err) {
        console.error("Error al guardar la inscripción:", err);
        return res
          .status(500)
          .json({ message: "Error al guardar la inscripción" });
      }
      res.status(200).json({ message: "Inscripción guardada exitosamente" });
    });
  } catch (err) {
    console.error("Error al verificar horarios:", err);
    res.status(500).json({ message: "Error al verificar los horarios" });
  }
});

// Función para verificar choques de horarios
function verificarChoquesHorarios(estudianteID, materiasSeleccionadas) {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT DISTINCT h1.ID_Curso, h1.Dia, h1.Hora_Inicio, h1.Hora_Fin
      FROM Matriculas m1
      JOIN Horario h1 ON m1.ID_Curso = h1.ID_Curso
      JOIN Matriculas m2 ON m1.ID_Estudiante = m2.ID_Estudiante
      JOIN Horario h2 ON m2.ID_Curso = h2.ID_Curso
      WHERE m1.ID_Estudiante = ?
      AND m2.ID_Estudiante = ?
      AND h1.Dia = h2.Dia
      AND ((h1.Hora_Inicio < h2.Hora_Fin AND h1.Hora_Fin > h2.Hora_Inicio))
    `;

    db.query(sql, [estudianteID, estudianteID], (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
}
// Ruta para obtener la matrícula de un estudiante
app.get("/matriculas", (req, res) => {
  const estudianteID = 1;

  const sql = `
    SELECT 
        m.ID_Matricula,
        u.Nombre AS Nombre_Estudiante,
        u.Apellido AS Apellido_Estudiante,
        c.Asignatura AS Asignatura_Curso,
        c.Paralelo AS Paralelo_Curso,
        c.Creditos AS Creditos_Curso
    FROM 
        Matriculas m
    JOIN 
        Estudiante e ON m.ID_Estudiante = e.ID_Estudiante
    JOIN 
        Usuarios u ON e.ID_Usuario = u.ID_Usuario
    JOIN 
        Cursos c ON m.ID_Curso = c.ID_Curso
    WHERE 
        e.ID_Estudiante = ?`;

  db.query(sql, [estudianteID], (err, results) => {
    if (err) {
      console.error("Error al obtener los datos:", err);
      return res.status(500).json({ message: "Error al obtener los datos" });
    }
    res.json(results);
  });
});

// Ruta para generar el PDF
app.get("/generar-pdf", (req, res) => {
  const estudianteID = 1; // Asegúrate de usar el ID del estudiante correcto

  const doc = new PDFDocument();

  // Configurar el encabezado
  doc.fontSize(18).text("Detalles de la Matrícula", { align: "center" });
  doc.moveDown();

  // Consulta a la base de datos para obtener la matrícula del estudiante
  const sql = `
    SELECT 
        u.Nombre AS Nombre_Estudiante,
        u.Apellido AS Apellido_Estudiante,
        c.Asignatura AS Asignatura_Curso,
        c.Paralelo AS Paralelo_Curso,
        c.Creditos AS Creditos_Curso,
        h.Dia AS Dia_Curso,
        h.Hora_Inicio AS Hora_Inicio,
        h.Hora_Fin AS Hora_Fin
    FROM 
        Matriculas m
    JOIN 
        Estudiante e ON m.ID_Estudiante = e.ID_Estudiante
    JOIN 
        Usuarios u ON e.ID_Usuario = u.ID_Usuario
    JOIN 
        Cursos c ON m.ID_Curso = c.ID_Curso
    JOIN 
        Horario h ON c.ID_Curso = h.ID_Curso
    WHERE 
        e.ID_Estudiante = ?
  `;
  db.query(sql, [estudianteID], (err, results) => {
    if (err) {
      console.error("Error al obtener los datos:", err);
      return res.status(500).json({ message: "Error al obtener los datos" });
    }

    // Información del estudiante
    doc.fontSize(14).text(`Nombre: ${results[0].Nombre_Estudiante}`);
    doc.text(`Apellido: ${results[0].Apellido_Estudiante}`);
    doc.moveDown();

    // Tabla de asignaturas
    doc.fontSize(12).text("Asignaturas:", { underline: true });
    doc.moveDown();

    results.forEach((item) => {
      doc.text(
        `- ${item.Asignatura_Curso} (${item.Paralelo_Curso}) - Créditos: ${item.Creditos_Curso} - Horario: ${item.Dia_Curso} ${item.Hora_Inicio} a ${item.Hora_Fin}`
      );
    });

    // Finalizar y enviar el PDF
    doc.end();
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=matricula.pdf");

    // Pipe the PDF into the response
    doc.pipe(res);
  });
});

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});
