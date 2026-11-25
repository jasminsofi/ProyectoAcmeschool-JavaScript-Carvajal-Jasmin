// Define el Web Component TimerComponent para mostrar la cuenta regresiva del examen
export class TimerComponent extends HTMLElement {
  // Inicializa las propiedades internas del temporizador
  constructor() {
    super();
    this.remainingSeconds = 0;
    this.intervalId = null;
  }

  // Se ejecuta cuando el componente se inserta en el DOM
  connectedCallback() {
    // Dibuja el marcador inicial si aún no tiene contenido
    if (!this.innerHTML.trim()) {
      this.render();
    }
  }

  // Se ejecuta automáticamente si el componente se quita del DOM (evita intervalos sueltos)
  disconnectedCallback() {
    this.stop();
  }

  // Convierte segundos a formato MM:SS
  formatTime(totalSeconds) {
    const safeSeconds = Math.max(0, Number(totalSeconds) || 0);
    const minutes = Math.floor(safeSeconds / 60);
    const seconds = safeSeconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }

  // Inicia la cuenta regresiva recibiendo la duración en minutos
  start(minutes = 10) {
    // Detiene cualquier contador previo
    this.stop();

    // Calcula el total de segundos
    this.remainingSeconds = Math.max(1, Number(minutes) || 10) * 60;
    this.render();

    // Actualiza el reloj cada 1 segundo
    this.intervalId = setInterval(() => {
      this.remainingSeconds -= 1;
      this.render();

      // Cuando se agota el tiempo, detiene el reloj y avisa a la vista del examen
      if (this.remainingSeconds <= 0) {
        this.stop();
        this.dispatchEvent(new CustomEvent("time-up", { bubbles: true }));
      }
    }, 1000);
  }

  // Detiene el intervalo activo si existe
  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  // Dibuja el reloj en pantalla
  render() {
    this.innerHTML = `
      <div class="exam-timer">
        <span>Tiempo restante:</span>
        <strong id="timerDisplay">${this.formatTime(this.remainingSeconds)}</strong>
      </div>
    `;
  }
}

// Registra la etiqueta personalizada <timer-component> si aún no existe
if (!customElements.get("timer-component")) {
  customElements.define("timer-component", TimerComponent);
}