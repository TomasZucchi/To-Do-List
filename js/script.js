function showDivisionsWithDelay() {
    const cardDivisions = document.querySelectorAll(".card");
    const delay = 300;

    cardDivisions.forEach((card, index) => {
        setTimeout(() => {
            card.style.opacity = 1;
        }, (index + 1) * delay);
    });
}

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById('duedate').valueAsDate = new Date();
    const taskContainer = document.getElementById("TaskContainer");
    const addButton = document.querySelector(".bx-plus");
    const textInput = document.getElementById("todo");
    const dateInput = document.getElementById("duedate");
    const myDayLink = document.getElementById("o1");
    const thisWeekLink = document.getElementById("o2");
    const thisMonthLink = document.getElementById("o3");
    const otherLink = document.getElementById("o4");
    const titleLink = document.getElementById("header_title");

    // const taskList = document.getElementById("taskList");

   // Función para generar un ID numérico único
    const generateNumericID = () => {
        return Date.now() + Math.floor(Math.random() * 1000);
    };

    // Función para manejar el envío de datos
    const saveData = () => {
        const taskDescription = textInput.value;
        const dueDate = dateInput.value;

        // Verifica si se han ingresado tanto el texto como la fecha antes de guardar
        if (taskDescription.trim() === "" || dueDate === "") {
            swal({
                title: "Error",
                text: "¡Por favor ingrese la tarea y la fecha de vencimiento!",
                icon: "error",
            });
        } else {
            // Generar un ID numérico único
            const id = generateNumericID();

            // Crear un nuevo objeto que representa la tarea por hacer
            const task = {
                id: id,
                text: taskDescription,
                date: dueDate,
                completed: false,
                timestamp: Date.now(), // Marca de tiempo abreviada en milisegundos
            };

            // Convierte el objeto de tarea a una cadena JSON
            const taskData = JSON.stringify(task);

            // Guarda los datos JSON en LocalStorage con el ID único como clave
            localStorage.setItem(id, taskData);

            // Limpia los campos de texto y fecha después de guardar
            textInput.value = "";
            dateInput.value = "";
            displayTasks(currentSection);
        }
    };

    addButton.addEventListener("click", saveData);

    // Agregar un listener de evento de tecla (keypress) al campo de texto y al campo de fecha
    textInput.addEventListener("keypress", (event) => {
        if (event.key === "Enter") {
            saveData();
        }
    });

    dateInput.addEventListener("keypress", (event) => {
        if (event.key === "Enter") {
            saveData();
        }
    });

    // Función para verificar si una fecha es hoy
    const isToday = (dateString) => {
        const today = new Date();
        const date = new Date(dateString);
        return date.toDateString() === today.toDateString();
    };
    // Función para recuperar las tareas desde LocalStorage y mostrarlas
    const displayTasks = (section, tasksToDisplay) => {
        currentSection = section;
        const tasks = Object.entries(localStorage)
        .filter(([key]) => key !== "userPreferences")
        .map(([, tasks]) => JSON.parse(tasks));
        const tasksToRender = tasksToDisplay || tasks;
        tasks.sort((a, b) => new Date(a.date) - new Date(b.date));
        const todayDate = new Date().toLocaleDateString("en-CA");

        // Filtrar tareas según la sección seleccionada
        const filteredTasks = tasksToRender.filter((task) => {
            switch (section) {
                case "myDay":
                    titleLink.textContent = "Mi día";
                    return task.date === todayDate;
                case "thisWeek":
                    titleLink.textContent = "Semana actual";
                    const getStartOfWeek = (date) => {
                        const day = date.getDay();
                        return new Date(
                            date.getFullYear(),
                            date.getMonth(),
                            date.getDate() - day
                        );
                    };

                    const getEndOfWeek = (date) => {
                        const day = date.getDay();
                        return new Date(
                            date.getFullYear(),
                            date.getMonth(),
                            date.getDate() + (6 - day)
                        );
                    };

                    const today = new Date();
                    const startOfWeek = getStartOfWeek(today);
                    const endOfWeek = getEndOfWeek(today);

                    const taskDate = new Date(task.date); // Convertir task.date a un objeto Date para la comparación
                    return taskDate >= startOfWeek && taskDate <= endOfWeek;
                case "thisMonth":
                    titleLink.textContent = "Mes actual";
                    const getStartOfMonth = (date) => {
                        return new Date(date.getFullYear(), date.getMonth(), 1);
                    };

                    // Función para obtener la fecha de fin del mes actual
                    const getEndOfMonth = (date) => {
                        return new Date(date.getFullYear(), date.getMonth() + 1, 0);
                    };
                    const startOfMonth = getStartOfMonth(new Date());
                    const endOfMonth = getEndOfMonth(new Date());
                    return (
                        task.date >= startOfMonth.toISOString().slice(0, 10) &&
                        task.date <= endOfMonth.toISOString().slice(0, 10)
                    );
                case "other":
                    titleLink.textContent = "Todas las tareas";
                    return true; // Mostrar todas las tareas para la sección "Otro"
                default:
                    return false; // Ocultar tareas para secciones desconocidas
            }
        });

        taskContainer.innerHTML = filteredTasks
            .map(
                (task) => `
          <div class="card align" data-task-id="${task.id}">
            <input type="checkbox" name="task" id="${task.id}" ${task.completed ? "checked" : ""
                    }>
            <div ${task.completed ? 'class="marker done"' : 'class="marker"'}>
              <span>${task.text}</span>
              <p id="taskDate" class="date ${isToday(task.date) ? "today" : ""}">${isToday(task.date)
                        ? "Today"
                        : "<i class='bx bx-calendar-alt'></i> " + task.date
                    }</p>      
                <input type="date" id="hiddenDatePicker" style="display: none;" />        
            </div>
            <i class="bx bx-trash-alt"></i>
          </div>
        `
            )
            .join("");

        const searchInput = document.getElementById("search");

        // Función para manejar la entrada de búsqueda y filtrar las tareas
        const handleSearch = () => {
            toggleMenu();
            const searchText = searchInput.value.trim().toLowerCase();
            if (searchText !== "") {
                // Filtrar tareas en base al texto de búsqueda
                const filteredTasks = tasks.filter((task) =>
                    task.text.toLowerCase().includes(searchText)
                );
                displayTasks(currentSection, filteredTasks);
            } else {
                // Si el texto de búsqueda está vacío, mostrar todas las tareas
                displayTasks(currentSection);
            }
        };
        
        
        // Agregar un listener de evento keydown al campo de búsqueda
        const keydownHandler = (event) => {
            if (event.key === "Enter") {
                handleSearch();
                searchInput.removeEventListener("keydown", keydownHandler);
            }
        };
        
        // Agregar un listener de evento keydown al campo de búsqueda
        searchInput.addEventListener("keydown", keydownHandler);
        
        
        

        // Adjuntar el listener de evento al contenedor principal
        taskContainer.addEventListener("click", (event) => {
            // Manejar el cambio de estado del checkbox
            if (event.target.type === "checkbox" && event.target.name === "task") {
                const taskId = event.target.id;
                const task = tasks.find((task) => task.id.toString() === taskId);
                if (task) {
                    task.completed = event.target.checked;
                    localStorage.setItem(task.id, JSON.stringify(task));
                    const marker = event.target.nextElementSibling;
                    if (marker.classList.contains("marker")) {
                        marker.classList.toggle("done", task.completed);
                    }
                }
            }

            // Manejar el clic en el ícono de eliminar
            if (event.target.classList.contains("bx-trash-alt")) {
                const taskId = event.target.closest(".card").dataset.taskId;
                swal({
                    title: "¿Eliminar tarea actual?",
                    text: "¡Una vez eliminada, no podrás recuperar esta tarea!",
                    icon: "warning",
                    buttons: true,
                    dangerMode: true,
                }).then((willDelete) => {
                    if (willDelete) {
                        localStorage.removeItem(taskId);
                        event.target.closest(".card").remove();
                        swal("¡Puf! ¡Tu tarea ha sido eliminada!", {
                            icon: "success",
                        });
                    }
                });
            }

            if (event.target.classList.contains("date")) {
                const taskId = event.target.closest(".card").dataset.taskId;
                const task = tasks.find((task) => task.id.toString() === taskId);
        
                if (task) {
                    // Activar el selector de fecha
                    document.getElementById('hiddenDatePicker').showPicker();
        
                    // Escuchar cambios en el selector de fecha
                    document.getElementById('hiddenDatePicker').addEventListener('change', function () {
                        const selectedDate = this.value;
        
                        // Pedir confirmación antes de actualizar la fecha
                        swal({
                            title: "Estas seguro?",
                            text:  `Actualizar la fecha de vencimiento desde ${task.date} a ${selectedDate}.`,
                            icon: "info",
                            buttons: ["Cancel", "Yes"],
                        }).then((willChangeDate) => {
                            if (willChangeDate) {
                                // Actualizar la fecha en el almacenamiento local
                                task.date = selectedDate;
                                localStorage.setItem(taskId, JSON.stringify(task));
        
                                // Refrescar la visualización
                                displayTasks(currentSection);
                            } else {
                                // Restablecer el selector de fecha si el usuario cancela
                                document.getElementById('hiddenDatePicker').value = '';
                            }
                        });
                    });
                }
            }
        });
        showDivisionsWithDelay();
    };

    const buttonsDiv = document.querySelector(".buttons");
    buttonsDiv.addEventListener("click", () => {
        swal({
            title: "¿Borrar todos los datos?",
            text: "¡Una vez eliminados, no podrás recuperar estos datos!",
            icon: "warning",
            buttons: true,
            dangerMode: true,
        }).then((willDelete) => {
            if (willDelete) {
                // Obtener todas las claves de localStorage
                const keys = Object.keys(localStorage);
    
                // Filtrar la clave 'userPreferences'
                const keysToKeep = keys.filter(key => key !== "userPreferences");
    
                // Borrar localStorage excepto la clave 'userPreferences'
                keysToKeep.forEach(key => localStorage.removeItem(key));
    
                // Limpiar el contenedor de tareas
                taskContainer.innerHTML = "";
    
                swal("¡Todos los datos han sido eliminados!", {
                    icon: "success",
                });
            }
        });
    });
    

    
    const logoutLink = document.getElementById("logoutLink");

    logoutLink.addEventListener("click", () => {
        swal({
            title: "Estas seguro?",
            text: "Al cerrar sesión se eliminarán su nombre de perfil y su correo electrónico.",
            icon: "warning",
            buttons: ["Cancel", "Cerrar sesión"],
            dangerMode: true,
        }).then((willLogout) => {
            if (willLogout) {
                // El usuario hizo clic en "Cerrar sesión"
                // Eliminar las preferencias del usuario del localStorage
                localStorage.removeItem("userPreferences");
    
                // Refrescar la página actual
                window.location.reload();
            } else {
                // El usuario hizo clic en "Cancelar"
                // No hacer nada o manejar según sea necesario
            }
        });
    });
    
    function getUserPreferences() {
        const storedPreferences = localStorage.getItem("userPreferences");
        const defaultPreferences = {
            name: "Usuario",
            email: "Usuario@gmail.com",
        };

        return storedPreferences
            ? JSON.parse(storedPreferences)
            : defaultPreferences;
    }
    // Función para establecer las preferencias del usuario en localStorage
    function setUserPreferences(name, email) {
        const preferences = { name, email };
        localStorage.setItem("userPreferences", JSON.stringify(preferences));
    }

    // Función para solicitar al usuario su nombre y correo electrónico usando SweetAlert
    function promptForNameAndEmail() {
        swal({
            title: "Enter your information",
            content: {
                element: "div",
                attributes: {
                    innerHTML: `
          <div class="form__group field">
            <input type="input" class="form__field" placeholder="Name" id="swal-input-name" required="">
            <label for="swal-input-name" class="form__label">Name</label>
          </div>
          <div class="form__group field">
            <input type="input" class="form__field" placeholder="Email" id="swal-input-email" required="">
            <label for="swal-input-email" class="form__label">Email</label>
          </div>
        `,
                },
            },
            buttons: {
                cancel: "Cancel",
                confirm: "Save",
            },
            closeOnClickOutside: false,
        }).then((result) => {
            if (result && result.dismiss !== "cancel") {
                const name = document.getElementById("swal-input-name").value;
                const email = document.getElementById("swal-input-email").value;

                // Establecer valores predeterminados si el usuario no ingresó ningún detalle
                const finalName = name || "Usuario";
                const finalEmail = email || "Usuario@gmail.com";

                setUserPreferences(finalName, finalEmail);
                displayProfileData();
            }
        });
    }

    // Función para mostrar los datos del perfil del usuario
    function displayProfileData() {
        const preferences = getUserPreferences();

        const nameElement = document.getElementById("name");
        const emailElement = document.getElementById("email");

        nameElement.textContent = preferences.name;
        emailElement.textContent = preferences.email;
    }

    // Verificar si las preferencias del usuario ya están configuradas
    const preferences = getUserPreferences();

    if (
        preferences.name === "Usuario" &&
        preferences.email === "Usuario@gmail.com"
    ) {
        // Si las preferencias son predeterminadas, solicita al usuario su nombre y correo electrónico
        promptForNameAndEmail();
    }

    // Llamar a la función para mostrar los datos del perfil
    displayProfileData();


// Función para manejar el clic en el enlace de la sección y mostrar las tareas
const handleSectionLinkClick = (section, linkElement) => {
    displayTasks(section);
    toggleMenu();

    // Eliminar el listener de evento para el enlace de la sección clickeada
    linkElement.removeEventListener("click", () => handleSectionLinkClick(section, linkElement));
};

// Listeners de eventos para los enlaces de sección
myDayLink.addEventListener("click", function () { handleSectionLinkClick("myDay", myDayLink); });
thisWeekLink.addEventListener("click", function () { handleSectionLinkClick("thisWeek", thisWeekLink); });
thisMonthLink.addEventListener("click", function () { handleSectionLinkClick("thisMonth", thisMonthLink); });
otherLink.addEventListener("click", function () { handleSectionLinkClick("other", otherLink); });

    let currentSection = "myDay";
    displayTasks(currentSection);


    const burgerIcon = document.getElementById('burgerIcon');
    const containerLeft = document.getElementById('containerLeft');
  
    var toggleMenu = () => {
        containerLeft.classList.toggle('v-class');
        burgerIcon.classList.toggle('cross');
    };

    burgerIcon.addEventListener('click', toggleMenu);

    document.body.addEventListener('click', (event) => {
        const target = event.target;
    
        // Verificar si el elemento clickeado no está dentro del containerLeft
        if (!containerLeft.contains(target) && !burgerIcon.contains(target)) {
            containerLeft.classList.remove('v-class');
            burgerIcon.classList.remove('cross');
        }
    });



});

