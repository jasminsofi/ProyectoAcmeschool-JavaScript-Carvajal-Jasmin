class ExamCard
extends HTMLElement {

    set exam(value){

        this.innerHTML = `

        <div class="exam-card">

            <h3>
                ${value.titulo}
            </h3>

            <p>
                Código:
                ${value.codigo}
            </p>

            <p>
                Tiempo:
                ${value.tiempo} min
            </p>

            <p>
                Aprobación:
                ${value.porcentajeAprobacion}%
            </p>

            <button
            class="editExam"
            data-id="${value.id}">
            Editar
            </button>

            <button
            class="deleteExam"
            data-id="${value.id}">
            Eliminar
            </button>

        </div>
        `;

    }

}

customElements.define(
    "exam-card",
    ExamCard
);
