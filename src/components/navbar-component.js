// Web Component para la barra de navegación de Acme School
export class NavbarComponent extends HTMLElement {
  constructor() {
    super();
    // Usamos Light DOM para que main.css y themes.css apliquen directamente sin fricción
    this.user = null;
    this.activeRoute = 'take-exam';
  }

  connectedCallback() {
    this.render();
    this._bindEvents();
  }

  // Actualiza el estado de usuario y ruta activa desde app.js
  setState({ user = null, activeRoute = 'take-exam' }) {
    this.user = user;
    this.activeRoute = activeRoute;
    this.render();
    this._bindEvents();
  }

  render() {
    const isLoggedIn = Boolean(this.user);

    this.innerHTML = `
      <header class="navbar">
        <div class="navbar__brand">
          <span class="navbar__logo">Acme School</span>
        </div>

        <nav class="navbar__links" aria-label="Navegación principal">
          ${
            isLoggedIn
              ? `
                <button type="button" class="nav-btn ${this.activeRoute === 'users' ? 'is-active' : ''}" data-route="users">
                  Usuarios
                </button>
                <button type="button" class="nav-btn ${this.activeRoute === 'exams' ? 'is-active' : ''}" data-route="exams">
                  Exámenes
                </button>
                <button type="button" class="nav-btn ${this.activeRoute === 'take-exam' ? 'is-active' : ''}" data-route="take-exam">
                  Resolver Examen
                </button>
              `
              : `
                <button type="button" class="nav-btn ${this.activeRoute === 'take-exam' ? 'is-active' : ''}" data-route="take-exam">
                  Resolver Examen
                </button>
                <button type="button" class="nav-btn ${this.activeRoute === 'login' ? 'is-active' : ''}" data-route="login">
                  Iniciar Sesión
                </button>
              `
          }
        </nav>

        <div class="navbar__session">
          ${
            isLoggedIn
              ? `
                <span class="session-badge">${this.user.fullName} (${this.user.role})</span>
                <button type="button" class="btn-logout" id="logoutBtn">Cerrar sesión</button>
              `
              : `<span class="session-badge session-badge--public">Modo público</span>`
          }
        </div>
      </header>
    `;
  }

  _bindEvents() {
    this.querySelectorAll('[data-route]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const route = btn.dataset.route;
        this.dispatchEvent(
          new CustomEvent('navigate', {
            detail: { route },
            bubbles: true,
          })
        );
      });
    });

    const logoutBtn = this.querySelector('#logoutBtn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        this.dispatchEvent(
          new CustomEvent('logout', {
            bubbles: true,
          })
        );
      });
    }
  }
}

if (!customElements.get('acme-navbar')) {
  customElements.define('acme-navbar', NavbarComponent);
}