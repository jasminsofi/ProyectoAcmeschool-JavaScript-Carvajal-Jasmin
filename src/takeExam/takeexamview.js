// Importa el servicio de calificación, StorageManager y el Web Component del temporizador
import { TakeExamService } from "./takeexamservice.js";
import { StorageManager } from "../storage/storagemanager.js";
import "../components/timer-component.js";

const EXAMS_KEY = "acmeschool_exams";

// Vista encargada de listar exámenes disponibles, correr el temporizador y calificar
export class TakeExamView {
  constructor(container, onBackToExams = null) {
    this.container = container;
    this.onBackToExams = onBackToExams;
    this.exam = null;
    this.isSubmitted = false;
  }

  // Detiene el temporizador si está activo
  stopTimer() {
    const timerEl = this.container?.querySelector("#examTimer");
    if (timerEl && typeof timerEl.stop === "function") {
      timerEl.stop();
    }
  }

  // Obtiene todos los exámenes guardados en localStorage
  getExams() {
    return StorageManager.getItem(EXAMS_KEY, []);
  }

  // Punto de entrada: si recibe un examen o id lo abre; si no, muestra los exámenes disponibles
  render(examOrId = null) {
    this.stopTimer();
    this.isSubmitted = false;

    const exams = this.getExams();

    // Si no pasaron nada, muestra la lista de exámenes disponibles para elegir
    if (!examOrId) {
      this.renderExamList(exams);
      return;
    }

    // Busca el examen por objeto o por id
    const selectedExam =
      typeof examOrId === "object"
        ? examOrId
        : exams.find((item) => String(item.id) === String(examOrId));

    if (!selectedExam) {
      this.container.innerHTML = `
        <section class="take-exam-section">
          <button type="button" id="backToExamsBtn">← Volver a exámenes</button>
          <p>No se encontró el examen seleccionado.</p>
        </section>
      `;
      this.bindBackButton();
      return;
    }

    this.renderExamForm(selectedExam);
  }

  // Dibuja la lista de exámenes disponibles
  renderExamList(exams) {
    if (!Array.isArray(exams) || exams.length === 0) {
      this.container.innerHTML = `
        <section class="exams-list-section">
          <h2>Exámenes disponibles</h2>
          <p>No hay exámenes disponibles en este momento.</p>
        </section>
      `;
      return;
    }

    const cardsHtml = exams
      .map(
        (exam) => `
          <article class="exam-card">
            <h3>${exam.title}</h3>
            <p>${exam.description || ""}</p>
            <p><strong>Tiempo:</strong> ${exam.timeMinutes ?? 10} minutos</p>
            <p><strong>Porcentaje para aprobar:</strong> ${exam.passingScore ?? 70}%</p>
            <button type="button" class="start-exam-btn" data-exam-id="${exam.id}">
              Presentar examen
            </button>
          </article>
        `
      )
      .join("");

    this.container.innerHTML = `
      <section class="exams-list-section">
        <h2>Exámenes disponibles</h2>
        <p>Selecciona un examen para comenzar.</p>
        <div class="exams-grid">
          ${cardsHtml}
        </div>
      </section>
    `;

    // Conecta cada botón "Presentar examen" para abrir el examen elegido
    const buttons = this.container.querySelectorAll(".start-exam-btn");
    buttons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const examId = btn.dataset.examId;
        this.render(examId);
      });
    });
  }

  // Dibuja el formulario de un examen específico con su temporizador
  renderExamForm(exam) {
    this.exam = exam;
    const questions = Array.isArray(exam.questions) ? exam.questions : [];

    const questionsHtml = questions
      .map((question, index) => {
        const optionsHtml = (question.options || [])
          .map(
            (option) => `
              <label class="option-item">
                <input
                  type="radio"
                  name="question-${question.id}"
                  value="${option.id}"
                />
                <span>${option.description}</span>
              </label>
            `
          )
          .join("");

        return `
          <fieldset class="question-block">
            <legend>Pregunta ${index + 1}: ${question.text}</legend>
            ${optionsHtml}
          </fieldset>
        `;
      })
      .join("");

    this.container.innerHTML = `
      <section class="take-exam-section">
        <button type="button" id="backToExamsBtn">← Volver a exámenes</button>

        <h2>${exam.title}</h2>
        <p>${exam.description || ""}</p>
        <p><strong>Porcentaje mínimo para aprobar:</strong> ${exam.passingScore ?? 70}%</p>

        <!-- Web Component del temporizador regresivo -->
        <timer-component id="examTimer"></timer-component>

        <form id="takeExamForm">
          <div>
            <label for="studentId">Número de identificación del estudiante</label>
            <input type="text" id="studentId" required />
          </div>

          <div>
            <label for="studentName">Nombre completo del estudiante</label>
            <input type="text" id="studentName" required />
          </div>

          <div class="questions-list">
            ${questionsHtml || "<p>Este examen no tiene preguntas registradas.</p>"}
          </div>

          <button type="submit" id="submitExamBtn">Enviar examen</button>
        </form>

        <div id="examResultBox"></div>
      </section>
    `;

    this.bindBackButton();

    const form = this.container.querySelector("#takeExamForm");
    if (form) {
      form.addEventListener("submit", (event) => {
        event.preventDefault();
        this.submitExam();
      });
    }

    const timerEl = this.container.querySelector("#examTimer");
    if (timerEl && typeof timerEl.start === "function") {
      timerEl.start(exam.timeMinutes || 10);
      timerEl.addEventListener("time-up", () => {
        this.submitExam();
      });
    }
  }

  // Regresa a la lista de exámenes
  bindBackButton() {
    const backBtn = this.container.querySelector("#backToExamsBtn");
    if (!backBtn) return;

    backBtn.addEventListener("click", () => {
      this.stopTimer();
      if (typeof this.onBackToExams === "function") {
        this.onBackToExams();
      } else {
        this.render(null);
      }
    });
  }

  // Califica las respuestas con TakeExamService y muestra el resultado
  submitExam() {
    if (this.isSubmitted || !this.exam) return;
    this.isSubmitted = true;

    this.stopTimer();

    const studentId =
      this.container.querySelector("#studentId")?.value.trim() || "Sin ID";
    const studentName =
      this.container.querySelector("#studentName")?.value.trim() || "Estudiante";

    const answersByQuestionId = {};
    const questions = Array.isArray(this.exam.questions) ? this.exam.questions : [];

    for (const question of questions) {
      const checkedInput = this.container.querySelector(
        `input[name="question-${question.id}"]:checked`
      );
      if (checkedInput) {
        answersByQuestionId[question.id] = checkedInput.value;
      }
    }

    const result = TakeExamService.evaluate(this.exam, answersByQuestionId);

    const submitBtn = this.container.querySelector("#submitExamBtn");
    if (submitBtn) {
      submitBtn.disabled = true;
    }

    const resultBox = this.container.querySelector("#examResultBox");
    if (resultBox) {
      const statusText = result.passed ? "Aprobado" : "No aprobado";
      resultBox.innerHTML = `
        <h3>Resultado del examen</h3>
        <p><strong>Estudiante:</strong> ${studentName} (${studentId})</p>
        <p><strong>Aciertos:</strong> ${result.correctCount} de ${result.totalQuestions}</p>
        <p><strong>Puntaje:</strong> ${result.scorePercentage}% (Mínimo: ${result.passingScore}%)</p>
        <p><strong>Estado:</strong> ${statusText}</p>
      `;
    }
  }
}