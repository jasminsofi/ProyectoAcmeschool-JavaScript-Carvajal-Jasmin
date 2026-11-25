// Web Component de cuenta regresiva en tiempo real para el examen
export class TimerComponent extends HTMLElement {
  constructor() {
    super();
    this.remainingSeconds = 0;
    this.intervalId = null;
    this.expired = false;
  }

  connectedCallback() {
    this.render();
  }

  disconnectedCallback() {
    this.stop();
  }

  // Inicia el temporizador con la cantidad de minutos asignados al examen
  start(minutes) {
    this.stop();
    this.expired = false;
    const safeMinutes = Math.max(0, Number(minutes) || 0);
    this.remainingSeconds = Math.round(safeMinutes * 60);
    this.render();

    if (this.remainingSeconds <= 0) {
      this._handleExpire();
      return;
    }

    this.intervalId = setInterval(() => {
      this.remainingSeconds -= 1;

      if (this.remainingSeconds <= 0) {
        this.remainingSeconds = 0;
        this.render();
        this._handleExpire();
        return;
      }

      this.render();
    }, 1000);
  }

  // Detiene el intervalo de tiempo
  stop() {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  _handleExpire() {
    this.stop();
    if (this.expired) return;
    this.expired = true;

    this.dispatchEvent(
      new CustomEvent('time-expired', {
        bubbles: true,
      })
    );
  }

  _formatTime(totalSeconds) {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    const mm = String(mins).padStart(2, '0');
    const ss = String(secs).padStart(2, '0');
    return `${mm}:${ss}`;
  }

  render() {
    const isLowTime = this.remainingSeconds > 0 && this.remainingSeconds <= 60;
    this.innerHTML = `
      <div class="timer-box ${isLowTime ? 'timer-box--warning' : ''}" aria-live="polite">
        <span class="timer-box__label">Tiempo restante</span>
        <strong class="timer-box__clock">${this._formatTime(this.remainingSeconds)}</strong>
      </div>
    `;
  }
}

if (!customElements.get('acme-timer')) {
  customElements.define('acme-timer', TimerComponent);
}