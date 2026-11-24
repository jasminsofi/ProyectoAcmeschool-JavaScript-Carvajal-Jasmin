// Clave sencilla para guardar la sesión activa en localStorage
const SESSION_KEY = "acmeschool_session";

// Clase de autenticación con los métodos que necesita la barra de navegación
export class AuthService {
  // Devuelve los datos de la sesión actual o null si no hay sesión iniciada
  static getCurrentSession() {
    // Lee el valor guardado en localStorage
    const raw = localStorage.getItem(SESSION_KEY);
    // Si no hay nada guardado, retorna null
    if (!raw) return null;
    // Convierte el texto JSON de vuelta a objeto
    return JSON.parse(raw);
  }

  // Indica si existe una sesión activa (true o false)
  static isAuthenticated() {
    // Retorna true si getCurrentSession() devuelve un objeto válido
    return Boolean(this.getCurrentSession());
  }

  // Borra la sesión activa al cerrar sesión
  static logout() {
    // Elimina la clave de sesión en localStorage
    localStorage.removeItem(SESSION_KEY);
  }
}