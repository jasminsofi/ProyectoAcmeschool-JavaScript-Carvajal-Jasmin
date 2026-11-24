// Clase encargada de leer, guardar y borrar datos en localStorage de forma segura
export class StorageManager {
  // Obtiene un valor guardado en localStorage y lo convierte de JSON a objeto/arreglo
  static getItem(key, defaultValue = null) {
    try {
      // Lee el texto crudo almacenado bajo la clave
      const raw = localStorage.getItem(key);
      // Si existe, parsea el JSON; si no, retorna el valor por defecto
      return raw ? JSON.parse(raw) : defaultValue;
    } catch (error) {
      // Muestra un mensaje en consola si el JSON está corrupto o falla la lectura
      console.error(`Error leyendo "${key}" de localStorage:`, error);
      return defaultValue;
    }
  }

  // Convierte un valor a JSON y lo guarda en localStorage
  static setItem(key, value) {
    try {
      // Serializa el valor y lo guarda en localStorage
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      // Muestra un mensaje en consola si falla el guardado (por ejemplo, sin espacio)
      console.error(`Error guardando "${key}" en localStorage:`, error);
      return false;
    }
  }

  // Elimina una clave específica de localStorage
  static removeItem(key) {
    localStorage.removeItem(key);
  }
}