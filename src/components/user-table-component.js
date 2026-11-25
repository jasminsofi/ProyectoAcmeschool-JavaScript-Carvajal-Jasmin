// Web Component para mostrar la tabla de usuarios registrados
export class UserTableComponent extends HTMLElement {
  constructor() {
    super();
    this.users = [];
  }

  connectedCallback() {
    this.render();
    this._bindEvents();
  }

  setUsers(users = []) {
    this.users = Array.isArray(users) ? users : [];
    this.render();
    this._bindEvents();
  }

  render() {
    this.innerHTML = `
      <div class="table-wrapper">
        <h3>Usuarios Registrados</h3>
        ${
          this.users.length === 0
            ? `<p class="text-muted">No hay usuarios registrados todavía.</p>`
            : `
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Identificación</th>
                    <th>Nombre completo</th>
                    <th>Email</th>
                    <th>Teléfono</th>
                    <th>Cargo</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  ${this.users
                    .map(
                      (user) => `
                        <tr>
                          <td>${user.id}</td>
                          <td>${user.fullName}</td>
                          <td>${user.email}</td>
                          <td>${user.phone}</td>
                          <td><span class="badge">${user.role}</span></td>
                          <td class="actions-cell">
                            <button
                              type="button"
                              class="btn-edit"
                              data-action="edit"
                              data-id="${user.id}"
                            >
                              Actualizar
                            </button>
                            <button
                              type="button"
                              class="btn-danger"
                              data-action="delete"
                              data-id="${user.id}"
                            >
                              Eliminar
                            </button>
                          </td>
                        </tr>
                      `
                    )
                    .join('')}
                </tbody>
              </table>
            `
        }
      </div>
    `;
  }

  _bindEvents() {
    this.querySelectorAll('button[data-action]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const action = btn.dataset.action;
        const userId = btn.dataset.id;

        if (action === 'edit') {
          this.dispatchEvent(
            new CustomEvent('edit-user', {
              detail: { userId },
              bubbles: true,
            })
          );
        } else if (action === 'delete') {
          this.dispatchEvent(
            new CustomEvent('delete-user', {
              detail: { userId },
              bubbles: true,
            })
          );
        }
      });
    });
  }
}

if (!customElements.get('acme-user-table')) {
  customElements.define('acme-user-table', UserTableComponent);
}