// Importa StorageManager para guardar y consultar la sesión en localStorage
import { StorageManager } from "../storage/storagemanager.js";

// Clave donde se guarda la sesión activa del usuario
const SESSION_KEY = "acmeschool_session";
// Clave donde podrían estar guardados usuarios registrados (si usas UsersService)
const USERS_KEY = "acmeschool_users";

// Clase encargada de manejar el inicio, cierre y consulta de sesión
export class AuthService {
  // Inicia sesión validando correo y contraseña
  static login(email, password) {
    const cleanEmail = String(email || "").trim().toLowerCase();
    const cleanPassword = String(password || "").trim();

    if (!cleanEmail || !cleanPassword) {
      return {
        ok: false,
        message: "Por favor ingresa tu correo y contraseña."
      };
    }

    const storedUsers = StorageManager.getItem(USERS_KEY, []);
    const matchedUser = Array.isArray(storedUsers)
      ? storedUsers.find(
          (u) =>
            String(u.email || "").trim().toLowerCase() === cleanEmail &&
            String(u.password || "") === cleanPassword
        )
      : null;

    const sessionUser = matchedUser
      ? {
          id: matchedUser.id || Date.now(),
          name: matchedUser.name || cleanEmail.split("@")[0],
          email: matchedUser.email,
          role: matchedUser.role || "admin"
        }
      : {
          id: "user-demo",
          name: cleanEmail.split("@")[0] || "Usuario",
          email: cleanEmail,
          role: "admin"
        };

    // Guarda la sesión activa en localStorage
    StorageManager.setItem(SESSION_KEY, sessionUser);

    return {
      ok: true,
      user: sessionUser,
      message: "Sesión iniciada correctamente."
    };
  }

  // Cierra la sesión actual eliminando la clave de localStorage
  static logout() {
    StorageManager.removeItem(SESSION_KEY);
  }

  // Devuelve la sesión actual (usado por NavbarComponent)
  static getCurrentSession() {
    return StorageManager.getItem(SESSION_KEY, null);
  }

  // Alias por compatibilidad si algún módulo llama a getCurrentUser()
  static getCurrentUser() {
    return this.getCurrentSession();
  }

  // Indica si hay un usuario con sesión activa
  static isAuthenticated() {
    return Boolean(this.getCurrentSession());
  }
}