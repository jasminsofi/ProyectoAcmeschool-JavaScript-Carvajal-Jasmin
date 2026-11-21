// StorageManager para guardar los resultados de los exámenes presentados
import { StorageManager } from "../storage/storagemanager.js";

// Clave donde se guardarán los resultados en localStorage
const RESULTS_KEY = "acmeschool_results";

// Clase encargada de calcular la nota y guardar el resultado del examen
export class TakeExamService {
  // Recibe el examen, datos del estudiante y las respuestas elegidas (objeto { idPregunta: idOpcion })
  static gradeExam(exam, studentData, selectedAnswers) {
    // Obtiene todas las preguntas del examen
    const questions = exam.questions;
    // Contador de respuestas correctas
    let correctCount = 0;

    // Recorre cada pregunta del examen
    for (const question of questions) {
      // Busca cuál opción fue marcada como correcta en esta pregunta
      const correctOption = question.options.find((opt) => opt.isCorrect === true);
      // Obtiene el id de la opción que seleccionó el estudiante
      const chosenOptionId = selectedAnswers[question.id];

      // Si el estudiante eligió una opción y coincide con la correcta, suma 1 acierto
      if (correctOption && chosenOptionId === correctOption.id) {
        // Aumenta el contador de aciertos en 1
        correctCount = correctCount + 1;
      }
    }

    // Calcula el porcentaje de respuestas acertadas (evita dividir entre 0 si no hay preguntas)
    const percentage =
      questions.length > 0 ? Math.round((correctCount / questions.length) * 100) : 0;

    // Revisa si el porcentaje logrado alcanza o supera el porcentaje mínimo para aprobar
    const passed = percentage >= exam.passingScore;

    // Arma el objeto con el resultado final del estudiante
    const result = {
      // Número de identificación del estudiante
      idNumber: studentData.idNumber,
      // Nombre completo del estudiante
      fullName: studentData.fullName,
      // Título del examen resuelto
      examTitle: exam.title,
      // Cantidad de preguntas acertadas
      correctCount: correctCount,
      // Total de preguntas del examen
      totalQuestions: questions.length,
      // Porcentaje obtenido
      percentage: percentage,
      // Indica si aprobó (true) o no aprobó (false)
      passed: passed,
    };

    // Llama al método para guardar este resultado en localStorage
    this.saveResult(result);

    // Retorna el resultado para mostrarlo en pantalla
    return result;
  }

  // Guarda un resultado dentro del arreglo de resultados en localStorage
  static saveResult(result) {
    // Trae los resultados guardados antes (o un arreglo vacío si aún no hay)
    const results = StorageManager.getItem(RESULTS_KEY, []);
    // Agrega el nuevo resultado al final del arreglo
    results.push(result);
    // Guarda el arreglo actualizado en localStorage
    StorageManager.setItem(RESULTS_KEY, results);
  }

  // Obtiene todos los resultados guardados
  static getAllResults() {
    // Retorna los resultados desde localStorage
    return StorageManager.getItem(RESULTS_KEY, []);
  }
}