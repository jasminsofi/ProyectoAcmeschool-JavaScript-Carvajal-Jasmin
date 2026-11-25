import { AuthService } from './authservice.js';

export class LoginView {
  constructor(container, onLoginSuccess) {
    this.container = container;
    this.onLoginSuccess = onLoginSuccess;
  }

  render() {
    this.container.innerHTML = `
      <section class="card login-card" aria-labelledby="loginTitle">
        <h2 id="loginTitle">Iniciar Sesión</h2>
        <p class="text-muted">
          Acceso para personal administrativo y docentes. Los estudiantes pueden ir a <strong>Resolver Examen</strong> sin iniciar sesión.
        </p>

        <form id="loginForm" class="form-grid" novalidate>
          <div class="form-group">
            <label for="loginEmail">Correo electrónico</label>
            <input
              type="email"
              id="loginEmail"
              name="email"
              placeholder="correo@acmeschool.edu"
              required
            />
          </div>

          <div class="form-group">
            <label for="loginPassword">Contraseña</label>
            <input
              type="password"
              id="loginPassword"
              name="password"
              placeholder="Ingresa tu contraseña"
              required
            />
          </div>

          <p id="loginError" class="error-msg" role="alert" hidden></p>

          <div class="form-actions">
            <button type="submit" class="btn-primary">Ingresar</button>
          </div>
        </form>
      </section>
    `;

    this._bindEvents();
  }

  _bindEvents() {
    const form = this.container.querySelector('#loginForm');
    const emailInput = this.container.querySelector('#loginEmail');
    const passwordInput = this.container.querySelector('#loginPassword');
    const errorEl = this.container.querySelector('#loginError');

    form.addEventListener('submit', (event) => {
      event.preventDefault();
      errorEl.hidden = true;
      errorEl.textContent = '';

      const email = emailInput.value.trim();
      const password = passwordInput.value;

      if (!email || !password) {
        errorEl.textContent = 'Por favor completa el correo electrónico y la contraseña.';
        errorEl.hidden = false;
        return;
      }

      const result = AuthService.login(email, password);

      if (!result.ok) {
        errorEl.textContent = result.message;
        errorEl.hidden = false;
        return;
      }

      if (typeof this.onLoginSuccess === 'function') {
        this.onLoginSuccess(result.user);
      }
    });
  }
}