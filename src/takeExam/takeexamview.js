// Importa ExamsService para leer los exámenes disponibles
import { ExamsService } from "../exams/examsservice.js";
// Importa TakeExamService para calcular la calificación y verificar si aprobó
import { TakeExamService } from "./takeexamservice.js";
// Importa los Web Components para mostrar las tarjetas de examen y el cronómetro
import "../components/exam-card.js";
import "../components/timer-component.js";

// Clase encargada de dibujar y manejar la vista pública de resolución de exámenes
export class TakeExamView {
  // Recibe el contenedor del DOM donde se pintará la vista
  constructor(container) {
    // Guarda el elemento HTML donde irá esta vista
    this.container = container;
    // Guarda el examen seleccionado actualmente (null si está mostrando la lista)
    this.selectedExam = null;
    // Guarda el resultado final después de enviar o terminar el examen
    this.examResult = null;
  }

  // Dibuja la pantalla según el estado actual: lista de exámenes, examen activo o resultado
  render() {
    // Si ya hay un resultado calculado, muestra el resumen de calificación
    if (this.examResult) {
      this.renderResult();
      return;
    }

    // Si hay un examen seleccionado, muestra el formulario del estudiante y las preguntas
    if (this.selectedExam) {
      this.renderExamForm();
      return;
    }

    // Por defecto, muestra la lista de exámenes disponibles
    this.renderExamList();
  }

  // Muestra la lista de exámenes disponibles usando <exam-card>
  renderExamList() {
    // Obtiene todos los exámenes guardados
    const exams = ExamsService.getAll();

    // Crea una etiqueta <exam-card> por cada examen disponible
    const cardsHtml = exams
      .map(
        (exam) => `
          <exam-card
            exam-id="${exam.id}"
            title="${exam.title}"
            time="${exam.timeMinutes}"
            passing-score="${exam.passingScore}"
          ></exam-card>
        `
      )
      .join("");

    // Inserta el HTML con la lista de exámenes
    this.container.innerHTML = `
      <section class="take-exam-section">
        <h2>Exámenes disponibles</h2>
        <p>Selecciona un examen para comenzar.</p>
        <div class="exams-grid">
          ${cardsHtml || "<p>No hay exámenes disponibles por el momento.</p>"}
        </div>
      </section>
    `;

    // Escucha cuando el usuario hace clic en "Presentar examen" dentro de cualquier <exam-card>
    this.container.addEventListener("select-exam", (event) => {
      // Obtiene el examId enviado en event.detail
      const examId = event.detail.examId;
      // Busca el examen completo por su id
      this.selectedExam = ExamsService.getById(examId) || null;
      // Limpia cualquier resultado anterior
      this.examResult = null;
      // Vuelve a dibujar para abrir el examen seleccionado
      this.render();
    });
  }

  // Muestra el cronómetro, los datos del estudiante y las preguntas del examen
  renderExamForm() {
    // Guarda una referencia corta al examen activo
    const exam = this.selectedExam;

    // Construye el HTML de cada pregunta con sus opciones de respuesta
    const questionsHtml = (exam.questions || [])
      .map(
        (question, qIndex) => `
          <fieldset class="take-question">
            <legend>Pregunta ${qIndex + 1}: ${question.text}</legend>
            ${(question.options || [])
              .map(
                (opt) => `
                  <label class="option-item">
                    <input
                      type="radio"
                      name="question-${question.id}"
                      value="${opt.id}"
                      required
                    />
                    <span>${opt.description}</span>
                  </label>
                `
              )
              .join("")}
          </fieldset>
        `
      )
      .join("");

    // Inserta el HTML del examen en curso
    this.container.innerHTML = `
      <section class="active-exam-section">
        <button type="button" id="backToListBtn">← Volver a exámenes</button>

        <h2>${exam.title}</h2>
        <p>${exam.description}</p>
        <p><strong>Porcentaje mínimo para aprobar:</strong> ${exam.passingScore}%</p>

        <!-- Cronómetro en tiempo real con los minutos del examen -->
        <timer-component minutes="${exam.timeMinutes}" id="examTimer"></timer-component>

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
            ${questionsHtml}
          </div>

          <button type="submit">Enviar examen</button>
        </form>
      </section>
    `;

    // Botón para volver a la lista de exámenes sin enviar
    const backBtn = this.container.querySelector("#backToListBtn");
    backBtn.addEventListener("click", () => {
      // Quita el examen seleccionado
      this.selectedExam = null;
      // Vuelve a la lista
      this.render();
    });

    // Formulario de resolución del examen
    const form = this.container.querySelector("#takeExamForm");
    form.addEventListener("submit", (event) => {
      // Evita recargar la página
      event.preventDefault();
      // Envía y califica el examen
      this.submitExam();
    });

    // Escucha el evento "time-up" del cronómetro cuando el tiempo llega a 0
    const timerEl = this.container.querySelector("#examTimer");
    timerEl.addEventListener("time-up", () => {
      // Califica automáticamente el examen al acabarse el tiempo
      this.submitExam(true);
    });
  }

  // Recoge las respuestas del estudiante y calcula el resultado con TakeExamService
  submitExam(isTimeUp = false) {
    // Obtiene los datos ingresados por el estudiante (o valores por defecto si se acabó el tiempo)
    const studentIdInput = this.container.querySelector("#studentId");
    const studentNameInput = this.container.querySelector("#studentName");

    const studentId = studentIdInput ? studentIdInput.value.trim() : "";
    const studentName = studentNameInput ? studentNameInput.value.trim() : "";

    // Recorre las preguntas para guardar qué opción eligió el estudiante en cada una
    const answers = {};
    for (const question of this.selectedExam.questions || []) {
      // Busca el radio marcado para esta pregunta
      const checkedRadio = this.container.querySelector(
        `input[name="question-${question.id}"]:checked`
      );
      // Guarda el id de la opción elegida (o null si no respondió esa pregunta)
      answers[question.id] = checkedRadio ? checkedRadio.value : null;
    }

    // Llama a TakeExamService para evaluar el examen
    const evaluation = TakeExamService.evaluate(this.selectedExam, answers);

    // Guarda el resultado en la vista para mostrarlo en pantalla
    this.examResult = {
      studentId: studentId || "No registrada",
      studentName: studentName || "No registrado",
      examTitle: this.selectedExam.title,
      passingScore: this.selectedExam.passingScore,
      score: evaluation.score,
      passed: evaluation.passed,
      correctCount: evaluation.correctCount,
      totalQuestions: evaluation.totalQuestions,
      timedOut: isTimeUp,
    };

    // Dibuja la pantalla de resultado
    this.render();
  }

  // Muestra el resultado final del examen
  renderResult() {
    // Guarda una referencia corta al resultado
    const res = this.examResult;

    // Inserta el HTML con los datos del estudiante, puntaje y estado de aprobación
    this.container.innerHTML = `
      <section class="exam-result-section">
        <h2>Resultado del examen</h2>
        ${res.timedOut ? "<p><strong>Nota:</strong> El tiempo del examen finalizó.</p>" : ""}
        <p><strong>Estudiante:</strong> ${res.studentName} (${res.studentId})</p>
        <p><strong>Examen:</strong> ${res.examTitle}</p>
        <p><strong>Respuestas correctas:</strong> ${res.correctCount} de ${res.totalQuestions}</p>
        <p><strong>Calificación:</strong> ${res.score}%</p>
        <p><strong>Porcentaje mínimo requerido:</strong> ${res.passingScore}%</p>
        <p>
          <strong>Estado:</strong>
          ${res.passed ? "¡Aprobado!" : "No aprobado"}
        </p>

        <button type="button" id="finishExamBtn">Ver otros exámenes</button>
      </section>
    `;

    // Botón para regresar a la lista de exámenes disponibles
    const finishBtn = this.container.querySelector("#finishExamBtn");
    finishBtn.addEventListener("click", () => {
      // Limpia resultado y examen seleccionado
      this.examResult = null;
      this.selectedExam = null;
      // Vuelve a la lista
      this.render();
    });
  }
}