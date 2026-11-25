import { TakeExamService } from './takeexamservice.js';
import '../components/timer-component.js';
import '../components/exam-card.js';

export class TakeExamView {
  constructor(container) {
    this.container = container;
    this.step = 'list'; // 'list' | 'student-info' | 'taking' | 'result'
    this.selectedExam = null;
    this.student = null;
    this.selectedAnswers = {};
    this.lastResult = null;
    this.errorMessage = '';
  }

  render() {
    this._stopActiveTimer();

    if (this.step === 'student-info' && this.selectedExam) {
      this._renderStudentForm();
      return;
    }

    if (this.step === 'taking' && this.selectedExam) {
      this._renderExamSheet();
      return;
    }

    if (this.step === 'result' && this.lastResult) {
      this._renderResult();
      return;
    }

    this._renderExamList();
  }

  _stopActiveTimer() {
    const timerEl = this.container?.querySelector('acme-timer');
    if (timerEl && typeof timerEl.stop === 'function') {
      timerEl.stop();
    }
  }

  // 1. Lista de exámenes disponibles
  _renderExamList() {
    const exams = TakeExamService.getAvailableExams();

    this.container.innerHTML = `
      <section class="card" aria-labelledby="publicExamsTitle">
        <div class="section-header">
          <div>
            <h2 id="publicExamsTitle">Exámenes Disponibles</h2>
            <p class="text-muted">Selecciona un examen para comenzar. No necesitas iniciar sesión.</p>
          </div>
        </div>

        ${
          exams.length === 0
            ? `<p class="text-muted">No hay exámenes disponibles en este momento.</p>`
            : `<div id="publicExamsGrid" class="cards-grid"></div>`
        }
      </section>
    `;

    const grid = this.container.querySelector('#publicExamsGrid');
    if (!grid) return;

    exams.forEach((exam) => {
      const card = document.createElement('acme-exam-card');
      grid.appendChild(card);
      card.setExam(exam, 'public');
    });

    grid.addEventListener('exam-card-action', (event) => {
      if (event.detail.action === 'start') {
        const found = exams.find((ex) => String(ex.id) === String(event.detail.examId));
        if (found) {
          this.selectedExam = found;
          this.student = null;
          this.selectedAnswers = {};
          this.lastResult = null;
          this.errorMessage = '';
          this.step = 'student-info';
          this.render();
        }
      }
    });
  }

  // 2. Solicitud de número de identificación y nombre completo
  _renderStudentForm() {
    this.container.innerHTML = `
      <section class="card" aria-labelledby="studentDataTitle">
        <h2 id="studentDataTitle">Datos del Estudiante</h2>
        <p class="text-muted">
          Examen seleccionado: <strong>${this.selectedExam.title}</strong>
          (${this.selectedExam.durationMinutes} min · Aprobación: ${this.selectedExam.passingScore}%)
        </p>

        <form id="studentInfoForm" class="form-grid" novalidate>
          <div class="form-group">
            <label for="studentIdInput">Número de identificación</label>
            <input
              type="text"
              id="studentIdInput"
              placeholder="Ej: 1005123456"
              required
            />
          </div>

          <div class="form-group">
            <label for="studentNameInput">Nombre completo</label>
            <input
              type="text"
              id="studentNameInput"
              placeholder="Ej: Sofía Morales"
              required
            />
          </div>

          ${
            this.errorMessage
              ? `<p class="error-msg" role="alert">${this.errorMessage}</p>`
              : ''
          }

          <div class="form-actions">
            <button type="submit" class="btn-primary">Comenzar examen</button>
            <button type="button" id="backToListBtn" class="btn-secondary">Volver</button>
          </div>
        </form>
      </section>
    `;

    this.container.querySelector('#backToListBtn').addEventListener('click', () => {
      this.errorMessage = '';
      this.step = 'list';
      this.render();
    });

    this.container.querySelector('#studentInfoForm').addEventListener('submit', (event) => {
      event.preventDefault();
      const studentId = this.container.querySelector('#studentIdInput').value;
      const studentName = this.container.querySelector('#studentNameInput').value;

      const validation = TakeExamService.validateStudent({ studentId, studentName });
      if (!validation.ok) {
        this.errorMessage = validation.message;
        this._renderStudentForm();
        return;
      }

      this.student = validation.student;
      this.selectedAnswers = {};
      this.errorMessage = '';
      this.step = 'taking';
      this.render();
    });
  }

  // 3. Vista de resolución del examen con encabezado, cronómetro, preguntas y botón Terminar
  _renderExamSheet() {
    const exam = this.selectedExam;
    const totalQuestions = exam.questions.length;

    this.container.innerHTML = `
      <section class="card exam-sheet" aria-labelledby="examSheetTitle">
        <header class="exam-header">
          <div class="exam-header__info">
            <h2 id="examSheetTitle">${exam.title}</h2>
            <p class="text-muted">Estudiante: <strong>${this.student.name}</strong> (ID: ${this.student.id})</p>
            <div class="exam-header__stats">
              <span class="badge">Total de preguntas: ${totalQuestions}</span>
              <span class="badge">Porcentaje para aprobar: ${exam.passingScore}%</span>
            </div>
          </div>

          <acme-timer id="examTimer"></acme-timer>
        </header>

        <form id="takeExamForm" class="questions-form">
          ${exam.questions
            .map(
              (q, qIndex) => `
                <fieldset class="question-card">
                  <legend><strong>${qIndex + 1}. ${q.text}</strong></legend>
                  <div class="choices-group">
                    ${q.options
                      .map(
                        (opt) => `
                          <label class="choice-item">
                            <input
                              type="radio"
                              name="question-${q.id}"
                              value="${opt.id}"
                              ${this.selectedAnswers[q.id] === opt.id ? 'checked' : ''}
                            />
                            <span>${opt.text}</span>
                          </label>
                        `
                      )
                      .join('')}
                  </div>
                </fieldset>
              `
            )
            .join('')}

          <div class="form-actions">
            <button type="submit" id="finishExamBtn" class="btn-primary">Terminar</button>
          </div>
        </form>
      </section>
    `;

    // Captura selección única por pregunta
    this.container.querySelectorAll('input[type="radio"]').forEach((radio) => {
      radio.addEventListener('change', () => {
        const questionId = radio.name.replace('question-', '');
        this.selectedAnswers[questionId] = radio.value;
      });
    });

    const submitExam = () => {
      this._stopActiveTimer();
      this.lastResult = TakeExamService.evaluateAttempt({
        exam: this.selectedExam,
        student: this.student,
        selectedAnswersByQuestion: this.selectedAnswers,
      });
      this.step = 'result';
      this.render();
    };

    this.container.querySelector('#takeExamForm').addEventListener('submit', (event) => {
      event.preventDefault();
      submitExam();
    });

    const timerEl = this.container.querySelector('#examTimer');
    if (timerEl) {
      timerEl.addEventListener('time-expired', () => {
        submitExam();
      });
      timerEl.start(exam.durationMinutes);
    }
  }

  // 4. Resultado final con porcentaje de respuestas acertadas y estado de aprobación
  _renderResult() {
    const res = this.lastResult;

    this.container.innerHTML = `
      <section class="card result-card ${res.passed ? 'result-card--passed' : 'result-card--failed'}">
        <h2>Resultado del Examen</h2>
        <p class="text-muted"><strong>${res.examTitle}</strong> — ${res.studentName} (ID: ${res.studentId})</p>

        <div class="result-summary">
          <p class="result-percentage">Porcentaje acertado: <strong>${res.percentage}%</strong></p>
          <p>Respuestas correctas: <strong>${res.correctCount} de ${res.totalQuestions}</strong> (Mínimo requerido: ${res.passingScore}%)</p>
          <p class="result-status ${res.passed ? 'status-pass' : 'status-fail'}">
            ${
              res.passed
                ? '¡Felicitaciones! Has APROBADO el examen.'
                : 'No has alcanzado el porcentaje mínimo. Examen NO APROBADO.'
            }
          </p>
        </div>

        <div class="form-actions">
          <button type="button" id="backToExamsBtn" class="btn-primary">Volver a exámenes</button>
        </div>
      </section>
    `;

    this.container.querySelector('#backToExamsBtn').addEventListener('click', () => {
      this.selectedExam = null;
      this.student = null;
      this.selectedAnswers = {};
      this.lastResult = null;
      this.step = 'list';
      this.render();
    });
  }
}