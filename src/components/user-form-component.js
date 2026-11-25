// Web Component para crear o actualizar usuarios
export class UserFormComponent extends HTMLElement {
  constructor() {
    super();
    this.editingUser = null;
    this.errorMessage = '';
  }

  connectedCallback() {
    this.render();
    this._bindEvents();
  }

  // Carga un usuario en modo edición o limpia el formulario si es null
  setEditingUser(user) {
    this.editingUser = user || null;
    this.errorMessage = '';
    this.render();
    this._bindEvents();
  }

  // Muestra un mensaje de validación desde la vista
  setError(message) {
    this.errorMessage = message || '';
    const errorEl = this.querySelector('#userFormError');
    if (errorEl) {
      errorEl.textContent = this.errorMessage;
      errorEl.hidden = !this.errorMessage;
    }
  }

  render() {
    const isEditing = Boolean(this.editingUser);
    const user = this.editingUser || {
      id: '',
      fullName: '',
      email: '',
      phone: '',
      role: 'Docente',
      password: '',
    };

    this.innerHTML = `
      <form id="userForm" class="form-grid" novalidate>
        <h3>${isEditing ? `Actualizar Usuario (${user.id})` : 'Nuevo Usuario'}</h3>

        <div class="form-row">
          <div class="form-group">
            <label for="userId">Número de identificación</label>
            <input
              type="text"
              id="userId"
              name="id"
              value="${user.id}"
              placeholder="Ej: 1098765432"
              required
            />
          </div>

          <div class="form-group">
            <label for="userFullName">Nombre completo</label>
            <input
              type="text"
              id="userFullName"
              name="fullName"
              value="${user.fullName}"
              placeholder="Ej: Ana María Ruiz"
              required
            />
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="userEmail">Correo electrónico</label>
            <input
              type="email"
              id="userEmail"
              name="email"
              value="${user.email}"
              placeholder="usuario@acmeschool.edu"
              required
            />
          </div>

          <div class="form-group">
            <label for="userPhone">Teléfono</label>
            <input
              type="tel"
              id="userPhone"
              name="phone"
              value="${user.phone}"
              placeholder="Ej: 3105551234"
              required
            />
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="userRole">Cargo</label>
            <select id="userRole" name="role" required>
              <option value="Administrativo" ${user.role === 'Administrativo' ? 'selected' : ''}>
                Administrativo
              </option>
              <option value="Docente" ${user.role === 'Docente' ? 'selected' : ''}>
                Docente
              </option>
            </select>
          </div>

          <div class="form-group">
            <label for="userPassword">
              Contraseña ${isEditing ? '(déjala en blanco para conservar la actual)' : ''}
            </label>
            <input
              type="password"
              id="userPassword"
              name="password"
              placeholder="${isEditing ? 'Nueva contraseña (opcional)' : 'Mínimo 4 caracteres'}"
              ${isEditing ? '' : 'required'}
            />
          </div>
        </div>

        <p id="userFormError" class="error-msg" role="alert" ${this.errorMessage ? '' : 'hidden'}>
          ${this.errorMessage}
        </p>

        <div class="form-actions">
          <button type="submit" class="btn-primary">
            ${isEditing ? 'Actualizar Usuario' : 'Guardar Usuario'}
          </button>
          ${
            isEditing
              ? `<button type="button" id="cancelEditBtn" class="btn-secondary">Cancelar</button>`
              : ''
          }
        </div>
      </form>
    `;
  }

  _bindEvents() {
    const form = this.querySelector('#userForm');
    if (!form) return;

    form.addEventListener('submit', (event) => {
      event.preventDefault();

      const payload = {
        id: this.querySelector('#userId').value,
        fullName: this.querySelector('#userFullName').value,
        email: this.querySelector('#userEmail').value,
        phone: this.querySelector('#userPhone').value,
        role: this.querySelector('#userRole').value,
        password: this.querySelector('#userPassword').value,
      };

      this.dispatchEvent(
        new CustomEvent('user-submit', {
          detail: {
            isEditing: Boolean(this.editingUser),
            originalId: this.editingUser ? this.editingUser.id : null,
            userData: payload,
          },
          bubbles: true,
        })
      );
    });

    const cancelBtn = this.querySelector('#cancelEditBtn');
    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => {
        this.setEditingUser(null);
        this.dispatchEvent(
          new CustomEvent('cancel-edit', {
            bubbles: true,
          })
        );
      });
    }
  }
}

if (!customElements.get('acme-user-form')) {
  customElements.define('acme-user-form', UserFormComponent);
}