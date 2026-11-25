// Clase encargada de calificar las respuestas de un examen
export class TakeExamService {
  // Evalúa las respuestas del estudiante para un examen dado
  // answersByQuestionId es un objeto tipo { "q-1": "opt-2", "q-2": "opt-4" }
  static evaluate(exam, answersByQuestionId = {}) {
    // Obtiene el arreglo de preguntas del examen (o un arreglo vacío si no hay)
    const questions = Array.isArray(exam?.questions) ? exam.questions : [];
    const totalQuestions = questions.length;

    // Si el examen no tiene preguntas, evita dividir por cero
    if (totalQuestions === 0) {
      return {
        correctCount: 0,
        totalQuestions: 0,
        scorePercentage: 0,
        passed: false,
        passingScore: exam?.passingScore ?? 70,
      };
    }

    // Cuenta cuántas preguntas respondió correctamente el estudiante
    let correctCount = 0;

    for (const question of questions) {
      // Id de la opción seleccionada por el estudiante para esta pregunta
      const selectedOptionId = answersByQuestionId[question.id];
      // Busca la opción marcada como correcta dentro de la pregunta
      const correctOption = (question.options || []).find((opt) => opt.isCorrect);

      // Suma 1 punto si la opción elegida coincide con la opción correcta
      if (correctOption && selectedOptionId === correctOption.id) {
        correctCount++;
      }
    }

    // Calcula el porcentaje obtenido redondeado a entero
    const scorePercentage = Math.round((correctCount / totalQuestions) * 100);
    // Porcentaje mínimo exigido para aprobar el examen
    const passingScore = Number(exam?.passingScore ?? 70);
    // Determina si aprobó o no
    const passed = scorePercentage >= passingScore;

    // Retorna el resumen de calificación
    return {
      correctCount,
      totalQuestions,
      scorePercentage,
      passed,
      passingScore,
    };
  }
}