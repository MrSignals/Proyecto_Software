require("dotenv").config();
const express = require("express");
const mysql = require("mysql2");
const path = require("path"); // Para manejar rutas de archivos
const app = express();
const port = 3000;

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

// Ruta para servir el archivo index.html
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Ruta para obtener datos de la base de datos
app.get("/usuarios", (req, res) => {
  const sql = "SELECT ID_Usuario, Nombre, Tipo FROM Usuarios";
  db.query(sql, (err, results) => {
    if (err) throw err;
    res.json(results);
  });
});

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});
