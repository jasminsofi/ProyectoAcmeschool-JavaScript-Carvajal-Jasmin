// StorageManager para leer y guardar los usuarios en localStorage
import { StorageManager } from "../storage/storagemanager.js";

// Define la clave de localStorage donde se almacena la lista de usuarios
const USERS_KEY = "acmeschool_users";
// Define los cargos válidos permitidos según el enunciado del proyecto
const VALID_ROLES = ["Administrativo", "docente"];

// Exporta la clase UsersService con la lógica CRUD (crear, leer, actualizar, eliminar) de usuarios
export class UsersService {
  // Obtiene todos los usuarios registrados; si aún no hay ninguno, devuelve un arreglo vacío
  static getAll() {
    // Lee el arreglo de usuarios desde localStorage
    return StorageManager.getItem(USERS_KEY, []);
  }

  // Busca un usuario específico por su número de identificación
  static getByIdNumber(idNumber) {
    // Obtiene la lista completa de usuarios
    const users = this.getAll();
    // Retorna el usuario cuyo idNumber coincida exactamente, o undefined si no existe
    return users.find((user) => user.idNumber === idNumber);
  }

  // Crea un nuevo usuario tras validar los campos obligatorios y evitar duplicados
  static create(userData) {
    // Obtiene la lista actual de usuarios
    const users = this.getAll();
    // Limpia espacios en blanco de los campos de texto y normaliza el correo
    const idNumber = String(userData.idNumber || "").trim();
    const fullName = String(userData.fullName || "").trim();
    const email = String(userData.email || "").trim().toLowerCase();
    const phone = String(userData.phone || "").trim();
    const role = String(userData.role || "").trim();
    const password = String(userData.password || "");

    // Verifica que todos los campos obligatorios tengan información
    if (!idNumber || !fullName || !email || !phone || !role || !password) {
      // Devuelve error si falta algún dato requerido
      return { success: false, message: "Todos los campos del usuario son obligatorios." };
    }

    // Verifica que el cargo ingresado sea uno de los permitidos ("Administrativo" o "docente")
    if (!VALID_ROLES.includes(role)) {
      // Devuelve error si el cargo no corresponde a las opciones válidas
      return { success: false, message: 'El cargo debe ser "Administrativo" o "docente".' };
    }

    // Revisa si ya existe un usuario con el mismo número de identificación o correo
    const duplicated = users.some(
      // Compara idNumber o email (en minúsculas) para evitar registros repetidos
      (user) => user.idNumber === idNumber || user.email.toLowerCase() === email
    );

    // Si ya existe un usuario igual, impide crear el duplicado
    if (duplicated) {
      // Devuelve error indicando que el documento o correo ya está registrado
      return { success: false, message: "Ya existe un usuario con esa identificación o correo." };
    }

    // Construye el objeto nuevo del usuario con su estructura JSON
    const newUser = {
      idNumber,
      fullName,
      email,
      phone,
      role,
      password,
    };

    // Agrega el nuevo usuario al arreglo existente
    const updatedUsers = [...users, newUser];
    // Guarda la lista actualizada en localStorage
    StorageManager.setItem(USERS_KEY, updatedUsers);
    // Retorna éxito junto con el usuario creado
    return { success: true, user: newUser };
  }

  // Actualiza los datos de un usuario existente identificado por su originalIdNumber
  static update(originalIdNumber, updatedData) {
    // Obtiene la lista actual de usuarios
    const users = this.getAll();
    // Busca la posición (índice) del usuario que se desea editar
    const index = users.findIndex((user) => user.idNumber === originalIdNumber);

    // Si no se encuentra el usuario en el arreglo, retorna error
    if (index === -1) {
      // Devuelve error indicando que el usuario no existe
      return { success: false, message: "Usuario no encontrado para actualizar." };
    }

    // Prepara los datos actualizados manteniendo la contraseña anterior si se deja vacía al editar
    const nextIdNumber = String(updatedData.idNumber ?? users[index].idNumber).trim();
    const nextFullName = String(updatedData.fullName ?? users[index].fullName).trim();
    const nextEmail = String(updatedData.email ?? users[index].email).trim().toLowerCase();
    const nextPhone = String(updatedData.phone ?? users[index].phone).trim();
    const nextRole = String(updatedData.role ?? users[index].role).trim();
    const nextPassword =
      updatedData.password && String(updatedData.password).length > 0
        ? String(updatedData.password)
        : users[index].password;

    // Verifica que los campos obligatorios no queden vacíos
    if (!nextIdNumber || !nextFullName || !nextEmail || !nextPhone || !nextRole) {
      // Devuelve error si algún campo queda vacío tras la edición
      return { success: false, message: "No puedes dejar campos obligatorios vacíos." };
    }

    // Valida que el cargo continúe siendo "Administrativo" o "docente"
    if (!VALID_ROLES.includes(nextRole)) {
      // Devuelve error si el cargo no es válido
      return { success: false, message: 'El cargo debe ser "Administrativo" o "docente".' };
    }

    // Evita que al editar se tome la identificación o correo de otro usuario distinto
    const conflict = users.some(
      // Revisa todos los demás usuarios (distintos a index)
      (user, i) =>
        i !== index && (user.idNumber === nextIdNumber || user.email.toLowerCase() === nextEmail)
    );

    // Si hay conflicto con otro usuario, cancela la actualización
    if (conflict) {
      // Devuelve error por duplicidad con otro registro
      return {
        success: false,
        message: "Otro usuario ya utiliza esa identificación o correo.",
      };
    }

    // Crea el objeto actualizado del usuario
    const updatedUser = {
      idNumber: nextIdNumber,
      fullName: nextFullName,
      email: nextEmail,
      phone: nextPhone,
      role: nextRole,
      password: nextPassword,
    };

    // Reemplaza el usuario anterior por el actualizado dentro del arreglo
    users[index] = updatedUser;
    // Guarda los cambios en localStorage
    StorageManager.setItem(USERS_KEY, users);
    // Retorna éxito junto con el usuario actualizado
    return { success: true, user: updatedUser };
  }

  // Elimina un usuario de la lista según su número de identificación
  static delete(idNumber) {
    // Obtiene la lista actual de usuarios
    const users = this.getAll();
    // Filtra dejando todos los usuarios excepto el que coincide con idNumber
    const filteredUsers = users.filter((user) => user.idNumber !== idNumber);

    // Si el tamaño del arreglo no cambió, significa que no se encontró el usuario
    if (filteredUsers.length === users.length) {
      // Devuelve error indicando que no se eliminó ningún registro
      return { success: false, message: "No se encontró el usuario a eliminar." };
    }

    // Guarda la nueva lista sin el usuario eliminado en localStorage
    StorageManager.setItem(USERS_KEY, filteredUsers);
    // Retorna éxito indicando que el usuario fue eliminado
    return { success: true };
  }
}