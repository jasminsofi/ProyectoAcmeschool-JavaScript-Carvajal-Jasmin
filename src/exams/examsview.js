// Importa ExamsService para leer, crear, actualizar y eliminar exámenes
import { ExamsService } from "./examsservice.js";

// Clase encargada de dibujar y manejar la gestión de exámenes
export class ExamsView {
  // Recibe el contenedor del DOM donde se dibujará la vista
  constructor(container) {
    // Guarda el elemento HTML donde irá esta vista
    this.container = container;
  }

  // Dibuja el formulario de creación y la lista de exámenes guardados
  render() {
    // Obtiene todos los exámenes guardados en localStorage
    const exams = ExamsService.getAll();

    // Crea una fila o tarjeta sencilla por cada examen existente
    const examsListHtml = exams
      .map(
        (exam) => `
          <div class="exam-item">
            <div>
              <strong>${exam.code || "SIN-COD"} - ${exam.title}</strong>
              <p>${exam.description || ""}</p>
              <small>Tiempo: ${exam.timeMinutes} min | Aprobación: ${exam.passingScore}% | Preguntas: ${(exam.questions || []).length}</small>
            </div>
            <button type="button" class="delete-exam-btn" data-id="${exam.id}">Eliminar</button>
          </div>
        `
      )
      .join("");

    // Inserta el HTML dentro del contenedor principal
    this.container.innerHTML = `
      <section class="exams-management-section">
        <h2>Gestión de exámenes</h2>

        <!-- Formulario sencillo para crear un examen rápido de prueba -->
        <form id="createExamForm">
          <div>
            <label for="examCode">Código del examen</label>
            <input type="text" id="examCode" required />
          </div>

          <div>
            <label for="examTitle">Título del examen</label>
            <input type="text" id="examTitle" required />
          </div>

          <div>
            <label for="examTime">Tiempo (minutos)</label>
            <input type="number" id="examTime" min="1" value="15" required />
          </div>

          <div>
            <label for="examPassing">Porcentaje mínimo para aprobar (%)</label>
            <input type="number" id="examPassing" min="1" max="100" value="60" required />
          </div>

          <div>
            <label for="examDescription">Descripción</label>
            <input type="text" id="examDescription" required />
          </div>

          <fieldset>
            <legend>Pregunta inicial</legend>
            <div>
              <label for="questionText">Enunciado de la pregunta</label>
              <input type="text" id="questionText" required />
            </div>
            <div>
              <label for="opt1">Opción 1 (correcta)</label>
              <input type="text" id="opt1" required />
            </div>
            <div>
              <label for="opt2">Opción 2</label>
              <input type="text" id="opt2" required />
            </div>
          </fieldset>

          <button type="submit">Guardar examen</button>
        </form>

        <p id="examsMessage"></p>

        <h3>Exámenes registrados</h3>
        <div class="exams-list">
          ${examsListHtml || "<p>Aún no hay exámenes registrados.</p>"}
        </div>
      </section>
    `;

    // Obtiene el formulario y el área de mensajes
    const form = this.container.querySelector("#createExamForm");
    const messageEl = this.container.querySelector("#examsMessage");

    // Escucha el envío del formulario para crear un nuevo examen
    form.addEventListener("submit", (event) => {
      // Evita recargar la página
      event.preventDefault();

      // Arma la pregunta con dos opciones, marcando la primera como correcta
      const questionText = this.container.querySelector("#questionText").value.trim();
      const opt1Text = this.container.querySelector("#opt1").value.trim();
      const opt2Text = this.container.querySelector("#opt2").value.trim();

      const examData = {
        code: this.container.querySelector("#examCode").value.trim(),
        title: this.container.querySelector("#examTitle").value.trim(),
        timeMinutes: this.container.querySelector("#examTime").value,
        passingScore: this.container.querySelector("#examPassing").value,
        description: this.container.querySelector("#examDescription").value.trim(),
        questions: [
          {
            id: "q-" + Date.now(),
            text: questionText,
            options: [
              { id: "opt-1", description: opt1Text, isCorrect: true },
              { id: "opt-2", description: opt2Text, isCorrect: false },
            ],
          },
        ],
      };

      // Llama a ExamsService.create para guardar el examen
      const result = ExamsService.create(examData);

      // Si hubo error de validación, lo muestra; si no, vuelve a dibujar la vista
      if (!result.success) {
        messageEl.textContent = result.message;
        return;
      }

      // Vuelve a dibujar la lista con el nuevo examen guardado
      this.render();
    });

    // Busca todos los botones de eliminar examen
    const deleteButtons = this.container.querySelectorAll(".delete-exam-btn");
    for (const btn of deleteButtons) {
      btn.addEventListener("click", () => {
        // Obtiene el id del examen desde data-id
        const examId = btn.getAttribute("data-id");
        // Elimina el examen y vuelve a dibujar la vista
        ExamsService.delete(examId);
        this.render();
      });
    }
  }
}