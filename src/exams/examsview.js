import { ExamsService }
from "./examsservice.js";

export function renderExams(){

    const container =
    document.querySelector(
        "#examsContainer"
    );

    container.innerHTML = "";

    const exams =
    ExamsService.getAll();

    exams.forEach(exam=>{

        const card =
        document.createElement(
            "exam-card"
        );

        card.exam = exam;

        container.appendChild(
            card
        );

    });

}