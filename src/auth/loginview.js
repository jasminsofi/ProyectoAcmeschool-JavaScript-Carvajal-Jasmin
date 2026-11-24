// Importa AuthService desde esta misma carpeta (src/auth) para validar el ingreso
import { AuthService } from "./authservice.js";

// Clase encargada de mostrar el formulario de Login y manejar su envío
export class LoginView {
  // Recibe el contenedor del HTML donde se dibujará la vista y una función al iniciar sesión
  constructor(container, onLoginSuccess) {
    // Guarda el elemento HTML donde irá el formulario
    this.container = container;
    // Guarda la función que se ejecuta cuando el usuario inicia sesión bien
    this.onLoginSuccess = onLoginSuccess;
  }

  // Dibuja el formulario de Login dentro del contenedor
  render() {
    // Inserta el HTML del formulario de inicio de sesión
    this.container.innerHTML = `
      <section class="login-section">
        <h2>Iniciar sesión - Acme School</h2>
        <p>Ingresa tu correo y contraseña para entrar a los módulos privados.</p>

        <form id="loginForm">
          <div>
            <label for="loginEmail">Correo</label>
            <input type="email" id="loginEmail" required />
          </div>

          <div>
            <label for="loginPassword">Contraseña</label>
            <input type="password" id="loginPassword" required />
          </div>

          <button type="submit">Ingresar</button>
        </form>

        <p id="loginMessage"></p>
      </section>
    `;

    // Busca el formulario dentro del contenedor
    const form = this.container.querySelector("#loginForm");
    // Busca el párrafo donde se mostrarán los mensajes
    const messageEl = this.container.querySelector("#loginMessage");

    // Escucha cuando el usuario envía el formulario
    form.addEventListener("submit", (event) => {
      // Evita que la página se recargue sola
      event.preventDefault();

      // Obtiene lo que el usuario escribió en correo y contraseña
      const email = this.container.querySelector("#loginEmail").value;
      const password = this.container.querySelector("#loginPassword").value;

      // Verifica las credenciales usando AuthService.login
      const result = AuthService.login(email, password);

      // Si las credenciales son correctas
      if (result.success) {
        // Limpia mensajes anteriores
        messageEl.textContent = "";
        // Ejecuta la función avisando que inició sesión
        if (this.onLoginSuccess) {
          this.onLoginSuccess(result.user);
        }
      } else {
        // Si hubo error, muestra el mensaje en pantalla
        messageEl.textContent = result.message;
      }
    });
  }
}