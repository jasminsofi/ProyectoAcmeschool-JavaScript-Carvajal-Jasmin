import { StorageManager } from '../storage/storagemanager.js';
import { STORAGE_KEYS } from '../data/seeddata.js';

const VALID_ROLES = ['Administrativo', 'Docente'];

export class UsersService {
  // Devuelve todos los usuarios registrados
  static getAll() {
    return StorageManager.get(STORAGE_KEYS.USERS, []);
  }

  // Busca un usuario por su número de identificación
  static getById(id) {
    const users = this.getAll();
    return users.find((user) => String(user.id) === String(id)) || null;
  }

  // Valida los campos obligatorios y reglas básicas de un usuario
  static validate(userData, { isEditing = false, originalId = null } = {}) {
    const id = String(userData.id || '').trim();
    const fullName = String(userData.fullName || '').trim();
    const email = String(userData.email || '').trim().toLowerCase();
    const phone = String(userData.phone || '').trim();
    const role = String(userData.role || '').trim();
    const password = String(userData.password || '');

    if (!id || !fullName || !email || !phone || !role) {
      return {
        ok: false,
        message: 'Todos los campos obligatorios (identificación, nombre, correo, teléfono y cargo) deben completarse.',
      };
    }

    if (!VALID_ROLES.includes(role)) {
      return {
        ok: false,
        message: 'El cargo debe ser "Administrativo" o "Docente".',
      };
    }

    if (!email.includes('@') || !email.includes('.')) {
      return {
        ok: false,
        message: 'Ingresa un correo electrónico válido.',
      };
    }

    // Al crear exigimos contraseña; al editar, si la dejan vacía conservamos la actual
    if (!isEditing && password.length < 4) {
      return {
        ok: false,
        message: 'La contraseña debe tener al menos 4 caracteres.',
      };
    }

    const users = this.getAll();

    // Verifica que no exista otro usuario con la misma identificación
    const duplicateId = users.some(
      (u) => String(u.id) === id && (!isEditing || String(u.id) !== String(originalId))
    );
    if (duplicateId) {
      return {
        ok: false,
        message: `Ya existe un usuario registrado con la identificación "${id}".`,
      };
    }

    // Verifica que no exista otro usuario con el mismo correo
    const duplicateEmail = users.some(
      (u) =>
        u.email.toLowerCase() === email &&
        (!isEditing || String(u.id) !== String(originalId))
    );
    if (duplicateEmail) {
      return {
        ok: false,
        message: `Ya existe un usuario registrado con el correo "${email}".`,
      };
    }

    return {
      ok: true,
      data: { id, fullName, email, phone, role, password },
    };
  }

  // Crea un nuevo usuario
  static create(userData) {
    const validation = this.validate(userData, { isEditing: false });
    if (!validation.ok) {
      return validation;
    }

    const users = this.getAll();
    const newUser = validation.data;
    users.push(newUser);
    StorageManager.set(STORAGE_KEYS.USERS, users);

    return { ok: true, user: newUser };
  }

  // Actualiza un usuario existente identificado por originalId
  static update(originalId, userData) {
    const existing = this.getById(originalId);
    if (!existing) {
      return { ok: false, message: 'No se encontró el usuario a actualizar.' };
    }

    const validation = this.validate(userData, {
      isEditing: true,
      originalId,
    });
    if (!validation.ok) {
      return validation;
    }

    const updatedPayload = {
      ...validation.data,
      // Si al editar no escriben contraseña nueva, mantiene la anterior
      password: validation.data.password ? validation.data.password : existing.password,
    };

    const users = this.getAll().map((u) =>
      String(u.id) === String(originalId) ? updatedPayload : u
    );

    StorageManager.set(STORAGE_KEYS.USERS, users);
    return { ok: true, user: updatedPayload };
  }

  // Elimina un usuario por su identificación
  static remove(id) {
    const users = this.getAll();
    const filtered = users.filter((u) => String(u.id) !== String(id));

    if (filtered.length === users.length) {
      return { ok: false, message: 'No se encontró el usuario a eliminar.' };
    }

    StorageManager.set(STORAGE_KEYS.USERS, filtered);
    return { ok: true };
  }
}