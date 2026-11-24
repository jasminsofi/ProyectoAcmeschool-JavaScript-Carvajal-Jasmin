// Importa AuthService para saber si hay un usuario autenticado y permitir cerrar sesión
import { AuthService } from "../auth/authservice.js";

// Define la clase NavbarComponent extendiendo HTMLElement para crear la barra de navegación
export class NavbarComponent extends HTMLElement {
  // Se ejecuta automaticamente cuando el componente se inserta en el DOM
  connectedCallback() {
    // Dibuja la barra de navegación segun el estado actual de autenticación
    this.render();
  }

  // Método publico para volver a dibujar la barra cuando cambie la sesión o la vista
  refresh() {
    // Llama a render() para actualizar los enlaces y botones mostrados
    this.render();
  }

  // Dispara un evento personalizado para cambiar de vista en la aplicación
  navigateTo(viewName) {
    // Emite el evento "navigate" enviando el nombre de la vista destino
    this.dispatchEvent(
      new CustomEvent("navigate", {
        // Guarda el nombre de la vista solicitada dentro de detail
        detail: { view: viewName },
        // Permite que el evento suba hacia app.js o el contenedor principal
        bubbles: true,
      })
    );
  }

  // Dibuja el HTML de la barra según si el usuario inició sesión o no
  render() {
    // Consulta si hay un usuario autenticado actualmente
    const isLoggedIn = AuthService.isAuthenticated();
    // Obtiene los datos de la sesión actual (o null si no ha iniciado sesión)
    const session = AuthService.getCurrentSession();

    // se realiza el menú de enlaces según el estado de autenticación
    const privateLinksHtml = isLoggedIn
      ? `
        <button type="button" class="nav-btn" data-view="users">Gestión de usuarios</button>
        <button type="button" class="nav-btn" data-view="exams">Gestión de exámenes</button>
        <span class="nav-user">Hola, ${session.fullName}</span>
        <button type="button" class="nav-btn logout-btn" id="logoutBtn">Cerrar sesión</button>
      `
      : `
        <button type="button" class="nav-btn" data-view="login">Login</button>
      `;

    // Inserta la barra completa dentro del Web Component
    this.innerHTML = `
      <nav class="navbar">
        <strong class="brand">Acme School</strong>
        <div class="nav-links">
          <button type="button" class="nav-btn" data-view="take-exam">Resolver exámenes</button>
          ${privateLinksHtml}
        </div>
      </nav>
    `;

    // Selecciona todos los botones que cambian de vista usando data-view
    const viewButtons = this.querySelectorAll("[data-view]");
    // Recorre cada botón de navegación para asignarle su evento click
    for (const btn of viewButtons) {
      // Escucha el clic en el botón
      btn.addEventListener("click", () => {
        // Obtiene el nombre de la vista guardado en el atributo data-view
        const targetView = btn.getAttribute("data-view");
        // Llama a navigateTo para avisar qué vista abrir
        this.navigateTo(targetView);
      });
    }

    // Busca el botón de cerrar sesión (solo existe si isLoggedIn es true)
    const logoutBtn = this.querySelector("#logoutBtn");
    // Si existe el botón de cerrar sesión, le agrega el evento click
    if (logoutBtn) {
      // Escucha el clic para cerrar la sesión
      logoutBtn.addEventListener("click", () => {
        // Borra la sesión activa en AuthService
        AuthService.logout();
        // Vuelve a dibujar la barra ya sin sesión iniciada
        this.render();
        // Dispara el evento "logout" para que la app regrese a una vista segura
        this.dispatchEvent(new CustomEvent("logout", { bubbles: true }));
      });
    }
  }
}

// Registra la etiqueta personalizada <navbar-component> si aún no existe
if (!customElements.get("navbar-component")) {
  // Asocia el nombre "navbar-component" con la clase NavbarComponent
  customElements.define("navbar-component", NavbarComponent);
}