import { UsersService }
from "./usersservice.js";

export function renderUsers(){

    const table =
    document.querySelector(
        "#usersTable"
    );

    table.innerHTML = "";

    const users =
    UsersService.getAll();

    users.forEach(user => {

        table.innerHTML += `
            <tr>

                <td>
                    ${user.identificacion}
                </td>

                <td>
                    ${user.nombre}
                </td>

                <td>
                    ${user.email}
                </td>

                <td>
                    ${user.cargo}
                </td>

                <td>

                    <button
                    class="edit-user"
                    data-id="${user.id}">
                    Editar
                    </button>

                    <button
                    class="delete-user"
                    data-id="${user.id}">
                    Eliminar
                    </button>

                </td>

            </tr>
        `;

    });

}