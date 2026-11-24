// Importa UsersService desde esta misma carpeta para crear, editar, borrar y listar usuarios
import { UsersService } from "./usersservice.js";

// Clase encargada de dibujar la vista de gestión de usuarios y manejar sus acciones
export class UsersView {
  // Recibe el contenedor del DOM donde se pintará esta vista
  constructor(container) {
    // Guarda el elemento HTML donde irá el formulario y la tabla de usuarios
    this.container = container;
    // Guarda la identificación del usuario que se está editando (null si estamos creando uno nuevo)
    this.editingIdNumber = null;
  }

  // Dibuja el formulario y la lista de usuarios dentro del contenedor
  render() {
    // Obtiene todos los usuarios guardados para mostrarlos en pantalla
    const users = UsersService.getAll();
    // Busca el usuario a editar si editingIdNumber tiene un valor
    const userToEdit = this.editingIdNumber
      ? UsersService.getByIdNumber(this.editingIdNumber)
      : null;

    // Construye las filas de la tabla con los usuarios registrados
    const rowsHtml = users
      .map(
        (user) => `
          <tr>
            <td>${user.idNumber}</td>
            <td>${user.fullName}</td>
            <td>${user.email}</td>
            <td>${user.phone}</td>
            <td>${user.role}</td>
            <td>
              <button type="button" class="edit-btn" data-id="${user.idNumber}">Editar</button>
              <button type="button" class="delete-btn" data-id="${user.idNumber}">Eliminar</button>
            </td>
          </tr>
        `
      )
      .join("");

    // Inserta el HTML completo de la vista de usuarios
    this.container.innerHTML = `
      <section class="users-section">
        <h2>Gestión de usuarios</h2>

        <form id="userForm">
          <div>
            <label for="userIdNumber">Número de identificación</label>
            <input
              type="text"
              id="userIdNumber"
              value="${userToEdit ? userToEdit.idNumber : ""}"
              required
            />
          </div>

          <div>
            <label for="userFullName">Nombre completo</label>
            <input
              type="text"
              id="userFullName"
              value="${userToEdit ? userToEdit.fullName : ""}"
              required
            />
          </div>

          <div>
            <label for="userEmail">Correo electrónico</label>
            <input
              type="email"
              id="userEmail"
              value="${userToEdit ? userToEdit.email : ""}"
              required
            />
          </div>

          <div>
            <label for="userPhone">Teléfono</label>
            <input
              type="text"
              id="userPhone"
              value="${userToEdit ? userToEdit.phone : ""}"
              required
            />
          </div>

          <div>
            <label for="userRole">Cargo</label>
            <select id="userRole" required>
              <option value="">Selecciona un cargo</option>
              <option value="Administrativo" ${
                userToEdit && userToEdit.role === "Administrativo" ? "selected" : ""
              }>
                Administrativo
              </option>
              <option value="docente" ${
                userToEdit && userToEdit.role === "docente" ? "selected" : ""
              }>
                docente
              </option>
            </select>
          </div>

          <div>
            <label for="userPassword">Contraseña</label>
            <input
              type="password"
              id="userPassword"
              placeholder="${userToEdit ? "Déjala vacía para mantener la actual" : ""}"
              ${userToEdit ? "" : "required"}
            />
          </div>

          <button type="submit">
            ${userToEdit ? "Guardar cambios" : "Crear usuario"}
          </button>

          ${
            userToEdit
              ? '<button type="button" id="cancelEditBtn">Cancelar edición</button>'
              : ""
          }
        </form>

        <p id="userMessage"></p>

        <h3>Usuarios registrados</h3>
        <table>
          <thead>
            <tr>
              <th>Identificación</th>
              <th>Nombre</th>
              <th>Email</th>
              <th>Teléfono</th>
              <th>Cargo</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml || '<tr><td colspan="6">No hay usuarios registrados.</td></tr>'}
          </tbody>
        </table>
      </section>
    `;

    // Conecta los eventos del formulario y de los botones de editar/eliminar
    this.bindEvents();
  }

  // Asigna los eventos a los elementos dibujados en la vista
  bindEvents() {
    // Obtiene el formulario de usuarios
    const form = this.container.querySelector("#userForm");
    // Obtiene el párrafo para mostrar mensajes de éxito o error
    const messageEl = this.container.querySelector("#userMessage");

    // Escucha el envío del formulario para crear o actualizar un usuario
    form.addEventListener("submit", (event) => {
      // Evita que la página se recargue al enviar
      event.preventDefault();

      // Recoge los valores escritos en los campos del formulario
      const userData = {
        idNumber: this.container.querySelector("#userIdNumber").value,
        fullName: this.container.querySelector("#userFullName").value,
        email: this.container.querySelector("#userEmail").value,
        phone: this.container.querySelector("#userPhone").value,
        role: this.container.querySelector("#userRole").value,
        password: this.container.querySelector("#userPassword").value,
      };

      // Guarda el resultado de crear o editar
      let result;

      // Si estamos editando un usuario existente, llama a update; si no, a create
      if (this.editingIdNumber) {
        // Actualiza el usuario usando su identificación original
        result = UsersService.update(this.editingIdNumber, userData);
      } else {
        // Crea un nuevo usuario
        result = UsersService.create(userData);
      }

      // Si la operación salió bien
      if (result.success) {
        // Sale del modo edición por si estaba editando
        this.editingIdNumber = null;
        // Vuelve a dibujar la vista para ver la lista actualizada
        this.render();
        // Muestra un mensaje de confirmación
        this.container.querySelector("#userMessage").textContent =
          "Usuario guardado correctamente.";
      } else {
        // Si hubo error, muestra el mensaje que devolvió UsersService
        messageEl.textContent = result.message;
      }
    });

    // Busca el botón de cancelar edición si existe
    const cancelBtn = this.container.querySelector("#cancelEditBtn");
    // Si existe, al hacer clic limpia el modo edición y vuelve a dibujar
    if (cancelBtn) {
      cancelBtn.addEventListener("click", () => {
        // Limpia el id en edición
        this.editingIdNumber = null;
        // Vuelve a dibujar el formulario limpio
        this.render();
      });
    }

    // Busca todos los botones de "Editar"
    const editButtons = this.container.querySelectorAll(".edit-btn");
    // Recorre cada botón de editar para asignarle su acción
    for (const btn of editButtons) {
      btn.addEventListener("click", () => {
        // Guarda el idNumber del usuario seleccionado para cargarlo en el formulario
        this.editingIdNumber = btn.getAttribute("data-id");
        // Vuelve a dibujar la vista con los datos cargados para editar
        this.render();
      });
    }

    // Busca todos los botones de "Eliminar"
    const deleteButtons = this.container.querySelectorAll(".delete-btn");
    // Recorre cada botón de eliminar para asignarle su acción
    for (const btn of deleteButtons) {
      btn.addEventListener("click", () => {
        // Obtiene el idNumber del usuario a eliminar
        const idNumber = btn.getAttribute("data-id");
        // Llama a UsersService.delete para borrarlo de localStorage
        const result = UsersService.delete(idNumber);

        // Si se eliminó correctamente
        if (result.success) {
          // Si justo estaba editando ese usuario, cancela la edición
          if (this.editingIdNumber === idNumber) {
            this.editingIdNumber = null;
          }
          // Vuelve a dibujar la lista actualizada
          this.render();
          // Muestra mensaje de confirmación
          this.container.querySelector("#userMessage").textContent = "Usuario eliminado.";
        }
      });
    }
  }
}