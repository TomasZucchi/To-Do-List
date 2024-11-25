const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

// Configuración de CORS y body parser
app.use(cors());
app.use(bodyParser.json());

// Conexión a MySQL
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root', // cambia esto según tu configuración
  password: 'computacion', // cambia esto según tu configuración
});

// Conectar a MySQL
db.connect((err) => {
  if (err) {
    console.log('Error conectando a la base de datos: ', err);
  } else {
    console.log('Conectado a la base de datos MySQL');
    
    // Crear base de datos si no existe
    db.query('CREATE DATABASE IF NOT EXISTS todo_db;', (err) => {
      if (err) {
        console.log('Error creando base de datos:', err);
      } else {
        console.log('Base de datos todo_db creada');
        
        // Seleccionar la base de datos
        db.changeUser({ database: 'todo_db' }, (err) => {
          if (err) {
            console.log('Error seleccionando la base de datos:', err);
          } else {
            // Crear la tabla si no existe
            const createTableQuery = `
              CREATE TABLE IF NOT EXISTS todos (
                id INT AUTO_INCREMENT PRIMARY KEY,
                task VARCHAR(255) NOT NULL,
                completed BOOLEAN NOT NULL DEFAULT false
              );
            `;
            db.query(createTableQuery, (err) => {
              if (err) {
                console.log('Error creando la tabla:', err);
              } else {
                console.log('Tabla "todos" creada correctamente');
              }
            });
          }
        });
      }
    });

    // Iniciar el servidor después de que la base de datos esté lista
    app.listen(port, () => {
      console.log(`Servidor corriendo en http://localhost:${port}`);
    });
  }
});

// Rutas de la API
app.get('/todos', (req, res) => {
  db.query('SELECT * FROM todos', (err, results) => {
    if (err) {
      res.status(500).send({ error: 'Error al obtener tareas' });
    } else {
      res.json(results);
    }
  });
});

app.post('/todos', (req, res) => {
  const { task } = req.body;
  if (!task) {
    return res.status(400).send({ error: 'Tarea no especificada' });
  }

  db.query('INSERT INTO todos (task) VALUES (?)', [task], (err, results) => {
    if (err) {
      res.status(500).send({ error: 'Error al agregar tarea' });
    } else {
      res.status(201).send({ id: results.insertId, task });
    }
  });
});

app.delete('/todos/:id', (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM todos WHERE id = ?', [id], (err, results) => {
    if (err) {
      res.status(500).send({ error: 'Error al eliminar tarea' });
    } else {
      res.status(200).send({ message: 'Tarea eliminada' });
    }
  });
});

app.patch('/todos/:id', (req, res) => {
  const { id } = req.params;
  db.query('UPDATE todos SET completed = NOT completed WHERE id = ?', [id], (err, results) => {
    if (err) {
      res.status(500).send({ error: 'Error al actualizar tarea' });
    } else {
      res.status(200).send({ message: 'Tarea actualizada' });
    }
  });
});