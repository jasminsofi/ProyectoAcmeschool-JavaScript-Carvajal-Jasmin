// Define la clase ExamCard extendiendo HTMLElement para crear la tarjeta de examen
export class ExamCard extends HTMLElement {
  // Se ejecuta automáticamente cuando el componente entra al DOM
  connectedCallback() {
    // Lee el id del examen desde el atributo "exam-id" (por defecto cadena vacía)
    const examId = this.getAttribute("exam-id") || "";
    // Lee el título del examen desde el atributo "title"
    const title = this.getAttribute("title") || "Examen sin título";
    // Lee el tiempo en minutos desde el atributo "time"
    const time = this.getAttribute("time") || "0";
    // Lee el porcentaje de aprobación desde el atributo "passing-score"
    const passingScore = this.getAttribute("passing-score") || "0";

    // Dibuja la estructura HTML de la tarjeta dentro del componente
    this.innerHTML = `
      <article class="exam-card">
        <h3>${title}</h3>
        <p><strong>Tiempo:</strong> ${time} minutos</p>
        <p><strong>Porcentaje para aprobar:</strong> ${passingScore}%</p>
        <button type="button" class="start-exam-btn" data-exam-id="${examId}">
          Presentar examen
        </button>
      </article>
    `;

    // Busca el botón dentro de esta tarjeta para escuchar cuando hagan clic
    const button = this.querySelector(".start-exam-btn");
    // Agrega el evento click al botón
    button.addEventListener("click", () => {
      // Dispara un evento personalizado ("select-exam") enviando el id del examen elegido
      this.dispatchEvent(
        new CustomEvent("select-exam", {
          // detail permite enviar datos extra junto con el evento (en este caso el examId)
          detail: { examId: examId },
          // bubbles permite que el evento suba hacia el contenedor padre o la vista
          bubbles: true,
        })
      );
    });
  }
}

// Registra la etiqueta personalizada <exam-card> si aún no existe
if (!customElements.get("exam-card")) {
  // Asocia el nombre "exam-card" con la clase ExamCard
  customElements.define("exam-card", ExamCard);
}