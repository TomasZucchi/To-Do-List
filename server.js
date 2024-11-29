const express = require("express");
const mysql = require("mysql2");
const bodyParser = require("body-parser");
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "root",
  database: "todolist",
});

connection.connect((err) => {
  if (err) throw err;
  console.log("Connected to MySQL database");
});

app.post("/addTask", (req, res) => {
  const { taskDescription, dueDate, userName, userEmail } = req.body;

  // Primero, verifica si el usuario ya existe
  const checkUserQuery = "SELECT id FROM usuarios WHERE email = ?";
  connection.query(checkUserQuery, [userEmail], (err, results) => {
    if (err) {
      console.error("Error checking user:", err);
      res.status(500).send("Error checking user");
      return;
    }

    let userId;
    if (results.length > 0) {
      // El usuario ya existe
      userId = results[0].id;
      insertTask(userId);
    } else {
      // El usuario no existe, insertarlo
      const insertUserQuery =
        "INSERT INTO usuarios (nombre, email) VALUES (?, ?)";
      connection.query(
        insertUserQuery,
        [userName, userEmail],
        (err, results) => {
          if (err) {
            console.error("Error inserting user:", err);
            res.status(500).send("Error inserting user");
            return;
          }
          userId = results.insertId;
          insertTask(userId);
        }
      );
    }
  });

  // Función para insertar la tarea
  function insertTask(userId) {
    const insertTaskQuery =
      "INSERT INTO tareas (usuarios_id, descripcion, fecha_vencimiento) VALUES (?, ?, ?)";
    connection.query(
      insertTaskQuery,
      [userId, taskDescription, dueDate],
      (err, results) => {
        if (err) {
          console.error("Error inserting task:", err);
          res.status(500).send("Error inserting task");
          return;
        }
        res.send("Task added successfully");
      }
    );
  }
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
