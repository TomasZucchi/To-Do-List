CREATE DATABASE todolist;
USE todolist;

CREATE TABLE usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE
);

CREATE TABLE tareas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuarios_id INT NOT NULL,
  fecha_vencimiento DATE,
  completada BOOLEAN DEFAULT FALSE,
  FOREIGN KEY (usuarios_id) REFERENCES usuarios(id)
);
