// Web Component reutilizable para mostrar la información resumida de un examen
export class ExamCardComponent extends HTMLElement {
  constructor() {
    super();
    this.exam = null;
    this.mode = 'manage'; // 'manage' | 'public'
  }

  connectedCallback() {
    this.render();
    this._bindEvents();
  }

  setExam(exam, mode = 'manage') {
    this.exam = exam;
    this.mode = mode;
    this.render();
    this._bindEvents();
  }

  render() {
    if (!this.exam) {
      this.innerHTML = '';
      return;
    }

    const { id, code, title, durationMinutes, passingScore, description, questions = [] } = this.exam;

    this.innerHTML = `
      <article class="exam-card">
        <div class="exam-card__header">
          <span class="badge">${code || 'EXAMEN'}</span>
          <span class="exam-card__questions">${questions.length} pregunta(s)</span>
        </div>

        <h3 class="exam-card__title">${title}</h3>
        <p class="exam-card__desc">${description}</p>

        <ul class="exam-card__meta">
          <li><strong>Tiempo:</strong> ${durationMinutes} min</li>
          <li><strong>Aprobación:</strong> ${passingScore}%</li>
        </ul>

        <div class="exam-card__actions">
          ${
            this.mode === 'public'
              ? `<button type="button" class="btn-primary" data-action="start" data-id="${id}">Resolver examen</button>`
              : `
                <button type="button" class="btn-edit" data-action="edit" data-id="${id}">Actualizar</button>
                <button type="button" class="btn-danger" data-action="delete" data-id="${id}">Eliminar</button>
              `
          }
        </div>
      </article>
    `;
  }

  _bindEvents() {
    this.querySelectorAll('button[data-action]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const action = btn.dataset.action;
        const examId = btn.dataset.id;

        this.dispatchEvent(
          new CustomEvent('exam-card-action', {
            detail: { action, examId },
            bubbles: true,
          })
        );
      });
    });
  }
}

if (!customElements.get('acme-exam-card')) {
  customElements.define('acme-exam-card', ExamCardComponent);
}