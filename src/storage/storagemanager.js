// Maneja la lectura, escritura y borrado de datos en localStorage
export class StorageManager {
  // Obtiene un valor parseado desde localStorage; si no existe o falla, devuelve un valor por defecto
  static get(key, defaultValue = null) {
    try {
      const raw = localStorage.getItem(key);
      if (raw === null) {
        return defaultValue;
      }
      return JSON.parse(raw);
    } catch (error) {
      console.error(`Error leyendo "${key}" de localStorage:`, error);
      return defaultValue;
    }
  }

  // Guarda cualquier dato serializable en formato JSON
  static set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error(`Error guardando "${key}" en localStorage:`, error);
      return false;
    }
  }

  // Elimina una clave específica de localStorage
  static remove(key) {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error eliminando "${key}" de localStorage:`, error);
    }
  }
}