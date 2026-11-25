import { AuthService } from '../auth/authservice.js';
import { UsersService } from './usersservice.js';
import '../components/user-form-component.js';
import '../components/user-table-component.js';

export class UsersView {
  constructor(container) {
    this.container = container;
  }

  render() {
    // Protección adicional: este módulo es privado
    if (!AuthService.isAuthenticated()) {
      this.container.innerHTML = `
        <section class="card">
          <h2>Acceso restringido</h2>
          <p class="error-msg">Debes iniciar sesión para gestionar usuarios.</p>
        </section>
      `;
      return;
    }

    this.container.innerHTML = `
      <section class="card" aria-labelledby="usersModuleTitle">
        <div class="section-header">
          <div>
            <h2 id="usersModuleTitle">Gestión de Usuarios</h2>
            <p class="text-muted">Crea, actualiza o elimina usuarios administrativos y docentes.</p>
          </div>
        </div>

        <p id="usersFeedback" class="success-msg" role="status" hidden></p>

        <acme-user-form id="userFormComponent"></acme-user-form>
        <hr class="divider" />
        <acme-user-table id="userTableComponent"></acme-user-table>
      </section>
    `;

    this.formComponent = this.container.querySelector('#userFormComponent');
    this.tableComponent = this.container.querySelector('#userTableComponent');
    this.feedbackEl = this.container.querySelector('#usersFeedback');

    this._refreshTable();
    this._bindEvents();
  }

  _showFeedback(text) {
    if (!this.feedbackEl) return;
    this.feedbackEl.textContent = text;
    this.feedbackEl.hidden = !text;
  }

  _refreshTable() {
    if (this.tableComponent) {
      this.tableComponent.setUsers(UsersService.getAll());
    }
  }

  _bindEvents() {
    this.formComponent.addEventListener('user-submit', (event) => {
      const { isEditing, originalId, userData } = event.detail;
      const result = isEditing
        ? UsersService.update(originalId, userData)
        : UsersService.create(userData);

      if (!result.ok) {
        this.formComponent.setError(result.message);
        return;
      }

      this.formComponent.setEditingUser(null);
      this._refreshTable();
      this._showFeedback(
        isEditing
          ? `Usuario "${result.user.fullName}" actualizado correctamente.`
          : `Usuario "${result.user.fullName}" registrado correctamente.`
      );
    });

    this.tableComponent.addEventListener('edit-user', (event) => {
      const { userId } = event.detail;
      const user = UsersService.getById(userId);
      if (user) {
        this._showFeedback('');
        this.formComponent.setEditingUser(user);
        this.formComponent.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    });

    this.tableComponent.addEventListener('delete-user', (event) => {
      const { userId } = event.detail;
      const currentUser = AuthService.getCurrentUser();

      if (currentUser && String(currentUser.id) === String(userId)) {
        this.formComponent.setError('No puedes eliminar el usuario con el que tienes sesión iniciada.');
        return;
      }

      const result = UsersService.remove(userId);
      if (!result.ok) {
        this.formComponent.setError(result.message);
        return;
      }

      this.formComponent.setEditingUser(null);
      this._refreshTable();
      this._showFeedback('Usuario eliminado correctamente.');
    });
  }
}