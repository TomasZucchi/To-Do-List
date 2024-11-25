// Event Listeners
const toDoBtn = document.querySelector('.todo-btn');  // Asumiendo que tu botón tiene la clase 'todo-btn'
const toDoInput = document.querySelector('.todo-input');  // El input para agregar tareas
const toDoList = document.querySelector('.todo-list');  // La lista donde se muestran las tareas

// Funciones
function addToDo(event) {
    event.preventDefault();
    const task = toDoInput.value;
    if (task === '') {
        alert("You must write something!");
        return;
    }

    // Hacer petición POST para agregar tarea
    fetch('http://localhost:3000/todos', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ task })
    })
    .then(response => response.json())
    .then(data => {
        const toDoDiv = document.createElement("div");
        toDoDiv.classList.add('todo', `${savedTheme}-todo`);

        const newToDo = document.createElement('li');
        newToDo.innerText = task;
        newToDo.classList.add('todo-item');
        toDoDiv.appendChild(newToDo);

        const checked = document.createElement('button');
        checked.innerHTML = '<i class="fas fa-check"></i>';
        checked.classList.add('check-btn', `${savedTheme}-button`);
        toDoDiv.appendChild(checked);

        const deleted = document.createElement('button');
        deleted.innerHTML = '<i class="fas fa-trash"></i>';
        deleted.classList.add('delete-btn', `${savedTheme}-button`);
        toDoDiv.appendChild(deleted);

        toDoList.appendChild(toDoDiv);
        toDoInput.value = ''; // Limpiar el input
    })
    .catch(err => console.error('Error al agregar tarea:', err));
}

function deletecheck(event) {
    const item = event.target;
    if (item.classList[0] === 'delete-btn') {
        const todoId = item.parentElement.getAttribute('data-id');
        fetch(`http://localhost:3000/todos/${todoId}`, { method: 'DELETE' })
            .then(() => {
                item.parentElement.classList.add("fall");
                item.parentElement.addEventListener('transitionend', function() {
                    item.parentElement.remove();
                });
            })
            .catch(err => console.error('Error al eliminar tarea:', err));
    }
}

function getTodos() {
    fetch('http://localhost:3000/todos')
        .then(response => response.json())
        .then(todos => {
            todos.forEach(todo => {
                const toDoDiv = document.createElement("div");
                toDoDiv.classList.add("todo", `${savedTheme}-todo`);
                toDoDiv.setAttribute('data-id', todo.id);

                const newToDo = document.createElement('li');
                newToDo.innerText = todo.task;
                newToDo.classList.add('todo-item');
                toDoDiv.appendChild(newToDo);

                const checked = document.createElement('button');
                checked.innerHTML = '<i class="fas fa-check"></i>';
                checked.classList.add("check-btn", `${savedTheme}-button`);
                toDoDiv.appendChild(checked);

                const deleted = document.createElement('button');
                deleted.innerHTML = '<i class="fas fa-trash"></i>';
                deleted.classList.add("delete-btn", `${savedTheme}-button`);
                toDoDiv.appendChild(deleted);

                toDoList.appendChild(toDoDiv);
            });
        })
        .catch(err => console.error('Error al obtener tareas:', err));
}
