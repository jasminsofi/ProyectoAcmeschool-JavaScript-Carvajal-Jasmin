import { StorageManager } from '../storage/storagemanager.js';
import { STORAGE_KEYS } from '../data/seeddata.js';

export class AuthService {
  // Valida correo y contraseña contra los usuarios registrados
  static login(email, password) {
    const cleanEmail = email.trim().toLowerCase();
    const users = StorageManager.get(STORAGE_KEYS.USERS, []);

    const foundUser = users.find(
      (user) =>
        user.email.toLowerCase() === cleanEmail && user.password === password
    );

    if (!foundUser) {
      return {
        ok: false,
        message: 'Correo electrónico o contraseña incorrectos.',
      };
    }

    // Guardamos una sesión limpia sin exponer la contraseña
    const sessionData = {
      id: foundUser.id,
      fullName: foundUser.fullName,
      email: foundUser.email,
      role: foundUser.role,
      loggedAt: new Date().toISOString(),
    };

    StorageManager.set(STORAGE_KEYS.SESSION, sessionData);

    return {
      ok: true,
      user: sessionData,
    };
  }

  // Cierra la sesión actual
  static logout() {
    StorageManager.remove(STORAGE_KEYS.SESSION);
  }

  // Devuelve el usuario autenticado actual o null si no hay sesión
  static getCurrentUser() {
    return StorageManager.get(STORAGE_KEYS.SESSION, null);
  }

  // Indica si existe una sesión activa
  static isAuthenticated() {
    return Boolean(this.getCurrentUser());
  }
}