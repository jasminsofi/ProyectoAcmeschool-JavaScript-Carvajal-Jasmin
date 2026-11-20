export class StorageManager {
  static getItem(key, defaultValue = null) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : defaultValue;
    } catch (error) {
      console.error(`Error leyendo "${key}" de localStorage:`, error);
      return defaultValue;
    }
  }

  static setItem(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error(`Error guardando "${key}" en localStorage:`, error);
      return false;
    }
  }

  static removeItem(key) {
    localStorage.removeItem(key);
  }
}