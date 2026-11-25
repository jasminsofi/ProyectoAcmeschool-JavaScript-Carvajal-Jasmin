import { AuthService } from '../auth/authservice.js';
import { ExamsService } from './examsservice.js';
import '../components/exam-card.js';

export class ExamsView {
  constructor(container) {
    this.container = container;
    this.editingExamId = null;
    this.draftQuestions = [];
    this.errorMessage = '';
    this.successMessage = '';
  }

  // Crea una pregunta borrador con dos respuestas iniciales (la primera marcada como correcta)
  _createEmptyQuestion() {
    const uid = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    return {
      id: `q-${uid}`,
      text: '',
      options: [
        { id: `opt-${uid}-1`, text: '', isCorrect: true },
        { id: `opt-${uid}-2`, text: '', isCorrect: false },
      ],
    };
  }

  render() {
    if (!AuthService.isAuthenticated()) {
      this.container.innerHTML = `
        <section class="card">
          <h2>Acceso restringido</h2>
          <p class="error-msg">Debes iniciar sesión para gestionar exámenes.</p>
        </section>
      `;
      return;
    }

    if (this.draftQuestions.length === 0 && !this.editingExamId) {
      this.draftQuestions = [this._createEmptyQuestion()];
    }

    const exams = ExamsService.getAll();

    this.container.innerHTML = `
      <section class="card" aria-labelledby="examsModuleTitle">
        <div class="section-header">
          <div>
            <h2 id="examsModuleTitle">Gestión de Exámenes</h2>
            <p class="text-muted">Crea, actualiza o elimina exámenes y configura una única respuesta correcta por pregunta.</p>
          </div>
        </div>

        ${this.successMessage ? `<p class="success-msg" role="status">${this.successMessage}</p>` : ''}
        ${this.errorMessage ? `<p class="error-msg" role="alert">${this.errorMessage}</p>` : ''}

        <!-- Formulario de Examen + Preguntas -->
        <form id="examForm" class="form-grid" novalidate>
          <h3>${this.editingExamId ? 'Actualizar Examen' : 'Nuevo Examen'}</h3>

          <div class="form-row">
            <div class="form-group">
              <label for="examCode">Código</label>
              <input type="text" id="examCode" placeholder="Ej: MAT-201" required />
            </div>

            <div class="form-group">
              <label for="examTitle">Título</label>
              <input type="text" id="examTitle" placeholder="Ej: Álgebra Básica" required />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="examDuration">Tiempo (minutos)</label>
              <input type="number" id="examDuration" min="1" placeholder="Ej: 20" required />
            </div>

            <div class="form-group">
              <label for="examPassing">Porcentaje de aprobación (%)</label>
              <input type="number" id="examPassing" min="1" max="100" placeholder="Ej: 70" required />
            </div>
          </div>

          <div class="form-group">
            <label for="examDescription">Descripción del examen</label>
            <textarea id="examDescription" rows="2" placeholder="Describe el tema o instrucciones del examen" required></textarea>
          </div>

          <div class="questions-builder">
            <div class="questions-builder__header">
              <h4>Preguntas del examen</h4>
              <button type="button" id="addQuestionBtn" class="btn-secondary">+ Agregar pregunta</button>
            </div>

            <div id="questionsContainer">
              ${this._renderQuestionsHtml()}
            </div>
          </div>

          <div class="form-actions">
            <button type="submit" class="btn-primary">
              ${this.editingExamId ? 'Actualizar Examen' : 'Guardar Examen'}
            </button>
            ${
              this.editingExamId
                ? `<button type="button" id="cancelExamEditBtn" class="btn-secondary">Cancelar edición</button>`
                : ''
            }
          </div>
        </form>

        <hr class="divider" />

        <!-- Tabla de Exámenes Registrados -->
        <div class="table-wrapper">
          <h3>Exámenes Registrados</h3>
          ${
            exams.length === 0
              ? `<p class="text-muted">No existen exámenes registrados.</p>`
              : `
                <table class="data-table">
                  <thead>
                    <tr>
                      <th>Código</th>
                      <th>Título</th>
                      <th>Tiempo</th>
                      <th>Aprobación</th>
                      <th>Preguntas</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${exams
                      .map(
                        (exam) => `
                          <tr>
                            <td>${exam.code}</td>
                            <td>${exam.title}</td>
                            <td>${exam.durationMinutes} min</td>
                            <td>${exam.passingScore}%</td>
                            <td>${exam.questions.length}</td>
                            <td class="actions-cell">
                              <button type="button" class="btn-edit" data-action="edit" data-id="${exam.id}">
                                Actualizar
                              </button>
                              <button type="button" class="btn-danger" data-action="delete" data-id="${exam.id}">
                                Eliminar
                              </button>
                            </td>
                          </tr>
                        `
                      )
                      .join('')}
                  </tbody>
                </table>
              `
          }
        </div>
      </section>
    `;

    if (this.editingExamId) {
      const current = ExamsService.getById(this.editingExamId);
      if (current) {
        this.container.querySelector('#examCode').value = current.code;
        this.container.querySelector('#examTitle').value = current.title;
        this.container.querySelector('#examDuration').value = current.durationMinutes;
        this.container.querySelector('#examPassing').value = current.passingScore;
        this.container.querySelector('#examDescription').value = current.description;
      }
    }

    this._bindEvents();
  }

  _renderQuestionsHtml() {
    return this.draftQuestions
      .map(
        (q, qIndex) => `
          <div class="question-box" data-q-index="${qIndex}">
            <div class="question-box__top">
              <label for="qText-${qIndex}"><strong>Pregunta #${qIndex + 1}</strong></label>
              ${
                this.draftQuestions.length > 1
                  ? `<button type="button" class="btn-danger btn-sm" data-remove-question="${qIndex}">Quitar pregunta</button>`
                  : ''
              }
            </div>

            <input
              type="text"
              id="qText-${qIndex}"
              class="q-text-input"
              data-q-index="${qIndex}"
              value="${q.text}"
              placeholder="Escribe el enunciado de la pregunta"
              required
            />

            <div class="options-list">
              <p class="text-muted small-text">Selecciona con el botón circular cuál es la <strong>única respuesta correcta</strong>:</p>
              ${q.options
                .map(
                  (opt, oIndex) => `
                    <div class="option-row">
                      <input
                        type="radio"
                        name="correct-q-${qIndex}"
                        class="opt-correct-radio"
                        data-q-index="${qIndex}"
                        data-o-index="${oIndex}"
                        ${opt.isCorrect ? 'checked' : ''}
                        aria-label="Marcar opción ${oIndex + 1} como correcta"
                      />
                      <input
                        type="text"
                        class="opt-text-input"
                        data-q-index="${qIndex}"
                        data-o-index="${oIndex}"
                        value="${opt.text}"
                        placeholder="Descripción de la respuesta ${oIndex + 1}"
                        required
                      />
                      ${
                        q.options.length > 2
                          ? `<button type="button" class="btn-secondary btn-sm" data-remove-option="${qIndex}:${oIndex}">✕</button>`
                          : ''
                      }
                    </div>
                  `
                )
                .join('')}
            </div>

            <button type="button" class="btn-secondary btn-sm" data-add-option="${qIndex}">
              + Agregar respuesta
            </button>
          </div>
        `
      )
      .join('');
  }

  // Sincroniza lo escrito en los inputs de preguntas/opciones antes de re-renderizar
  _syncDraftFromDom() {
    this.container.querySelectorAll('.q-text-input').forEach((input) => {
      const qIdx = Number(input.dataset.qIndex);
      if (this.draftQuestions[qIdx]) {
        this.draftQuestions[qIdx].text = input.value;
      }
    });

    this.container.querySelectorAll('.opt-text-input').forEach((input) => {
      const qIdx = Number(input.dataset.qIndex);
      const oIdx = Number(input.dataset.oIndex);
      if (this.draftQuestions[qIdx] && this.draftQuestions[qIdx].options[oIdx]) {
        this.draftQuestions[qIdx].options[oIdx].text = input.value;
      }
    });

    this.container.querySelectorAll('.opt-correct-radio').forEach((radio) => {
      const qIdx = Number(radio.dataset.qIndex);
      const oIdx = Number(radio.dataset.oIndex);
      if (radio.checked && this.draftQuestions[qIdx]) {
        // Garantiza que solo la opción marcada tenga isCorrect: true
        this.draftQuestions[qIdx].options.forEach((opt, idx) => {
          opt.isCorrect = idx === oIdx;
        });
      }
    });
  }

  _bindEvents() {
    const form = this.container.querySelector('#examForm');
    if (!form) return;

    // Agregar pregunta
    const addQBtn = this.container.querySelector('#addQuestionBtn');
    if (addQBtn) {
      addQBtn.addEventListener('click', () => {
        this._syncDraftFromDom();
        this.draftQuestions.push(this._createEmptyQuestion());
        this.render();
      });
    }

    // Quitar pregunta
    this.container.querySelectorAll('[data-remove-question]').forEach((btn) => {
      btn.addEventListener('click', () => {
        this._syncDraftFromDom();
        const qIdx = Number(btn.dataset.removeQuestion);
        this.draftQuestions.splice(qIdx, 1);
        this.render();
      });
    });

    // Agregar respuesta a una pregunta
    this.container.querySelectorAll('[data-add-option]').forEach((btn) => {
      btn.addEventListener('click', () => {
        this._syncDraftFromDom();
        const qIdx = Number(btn.dataset.addOption);
        const uid = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
        this.draftQuestions[qIdx].options.push({
          id: `opt-${uid}`,
          text: '',
          isCorrect: false,
        });
        this.render();
      });
    });

    // Quitar respuesta de una pregunta
    this.container.querySelectorAll('[data-remove-option]').forEach((btn) => {
      btn.addEventListener('click', () => {
        this._syncDraftFromDom();
        const [qIdx, oIdx] = btn.dataset.removeOption.split(':').map(Number);
        const removedWasCorrect = this.draftQuestions[qIdx].options[oIdx]?.isCorrect;
        this.draftQuestions[qIdx].options.splice(oIdx, 1);

        // Si se eliminó la respuesta correcta, marcamos la primera como correcta
        if (removedWasCorrect && this.draftQuestions[qIdx].options.length > 0) {
          this.draftQuestions[qIdx].options[0].isCorrect = true;
        }
        this.render();
      });
    });

    // Enviar formulario (crear o actualizar examen)
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      this._syncDraftFromDom();
      this.errorMessage = '';
      this.successMessage = '';

      const payload = {
        code: this.container.querySelector('#examCode').value,
        title: this.container.querySelector('#examTitle').value,
        durationMinutes: this.container.querySelector('#examDuration').value,
        passingScore: this.container.querySelector('#examPassing').value,
        description: this.container.querySelector('#examDescription').value,
        questions: this.draftQuestions,
      };

      const result = this.editingExamId
        ? ExamsService.update(this.editingExamId, payload)
        : ExamsService.create(payload);

      if (!result.ok) {
        this.errorMessage = result.message;
        this.render();
        return;
      }

      this.successMessage = this.editingExamId
        ? `Examen "${result.exam.title}" actualizado correctamente.`
        : `Examen "${result.exam.title}" creado correctamente.`;
      this.editingExamId = null;
      this.draftQuestions = [this._createEmptyQuestion()];
      this.render();
    });

    // Cancelar edición
    const cancelEditBtn = this.container.querySelector('#cancelExamEditBtn');
    if (cancelEditBtn) {
      cancelEditBtn.addEventListener('click', () => {
        this.editingExamId = null;
        this.draftQuestions = [this._createEmptyQuestion()];
        this.errorMessage = '';
        this.render();
      });
    }

    // Acciones de la tabla (Actualizar / Eliminar)
    this.container.querySelectorAll('button[data-action]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const action = btn.dataset.action;
        const examId = btn.dataset.id;

        if (action === 'edit') {
          const exam = ExamsService.getById(examId);
          if (exam) {
            this.editingExamId = exam.id;
            // Clonamos preguntas para editar sin mutar hasta guardar
            this.draftQuestions = JSON.parse(JSON.stringify(exam.questions));
            this.errorMessage = '';
            this.successMessage = '';
            this.render();
            this.container.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        } else if (action === 'delete') {
          const result = ExamsService.remove(examId);
          if (!result.ok) {
            this.errorMessage = result.message;
          } else {
            this.successMessage = 'Examen eliminado correctamente.';
            if (this.editingExamId === examId) {
              this.editingExamId = null;
              this.draftQuestions = [this._createEmptyQuestion()];
            }
          }
          this.render();
        }
      });
    });
  }
}