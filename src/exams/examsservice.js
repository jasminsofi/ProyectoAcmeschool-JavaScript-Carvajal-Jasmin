// Trae StorageManager para guardar y leer los exámenes en localStorage
import { StorageManager } from "../storage/storagemanager.js";

// Clave donde se guardan los exámenes en localStorage
const EXAMS_KEY = "acmeschool_exams";

// Clase con las operaciones para gestionar exámenes
export class ExamsService {
  // Devuelve todos los exámenes guardados o un arreglo vacío si no hay ninguno
  static getAll() {
    // Lee la lista de exámenes desde localStorage
    return StorageManager.getItem(EXAMS_KEY, []);
  }

  // Busca un examen por su id
  static getById(examId) {
    // Obtiene todos los exámenes
    const exams = this.getAll();
    // Retorna el examen que coincida con examId
    return exams.find((exam) => exam.id === examId);
  }

  // Revisa que las preguntas existan y que cada una tenga solo 1 respuesta correcta
  static hasValidQuestions(questions) {
    // Si no hay preguntas o el arreglo está vacío, retorna false
    if (!Array.isArray(questions) || questions.length === 0) {
      // No es válido sin preguntas
      return false;
    }

    // Revisa pregunta por pregunta
    for (const question of questions) {
      // Obtiene las opciones de la pregunta
      const options = question.options || [];
      // Cuenta cuántas opciones tienen isCorrect en true
      const correctCount = options.filter((opt) => opt.isCorrect === true).length;

      // Cada pregunta debe tener exactamente una respuesta correcta
      if (correctCount !== 1) {
        // Si tiene 0 o más de 1 respuesta correcta, retorna false
        return false;
      }
    }

    // Si todas las preguntas cumplen, retorna true
    return true;
  }

  // Crea un nuevo examen y lo guarda en localStorage
  static create(examData) {
    // Obtiene los exámenes actuales
    const exams = this.getAll();

    // Verifica que las preguntas existan y tengan una sola respuesta correcta
    if (!this.hasValidQuestions(examData.questions)) {
      // Retorna error si no cumple esa regla
      return {
        success: false,
        message: "Cada pregunta debe tener una sola respuesta marcada como correcta.",
      };
    }

    // Crea el objeto del examen con un id sencillo
    const newExam = {
      // Genera un id único simple
      id: "exam-" + Date.now(),
      // Código del examen
      code: examData.code,
      // Título del examen
      title: examData.title,
      // Tiempo en minutos convertido a número
      timeMinutes: Number(examData.timeMinutes),
      // Porcentaje mínimo para aprobar convertido a número
      passingScore: Number(examData.passingScore),
      // Descripción del examen
      description: examData.description,
      // Lista de preguntas con sus respuestas
      questions: examData.questions,
    };

    // Agrega el nuevo examen a la lista
    exams.push(newExam);
    // Guarda la lista actualizada en localStorage
    StorageManager.setItem(EXAMS_KEY, exams);

    // Retorna éxito y el examen creado
    return { success: true, exam: newExam };
  }

  // Actualiza un examen existente buscando su id
  static update(examId, updatedData) {
    // Obtiene los exámenes actuales
    const exams = this.getAll();
    // Busca la posición del examen en el arreglo
    const index = exams.findIndex((exam) => exam.id === examId);

    // Si no lo encuentra, retorna error
    if (index === -1) {
      return { success: false, message: "Examen no encontrado." };
    }

    // Determina qué preguntas quedarán (las nuevas si vienen, o las que ya tenía)
    const nextQuestions = updatedData.questions ?? exams[index].questions;

    // Valida que las preguntas tengan una sola respuesta correcta
    if (!this.hasValidQuestions(nextQuestions)) {
      // Retorna error si no cumple la regla
      return {
        success: false,
        message: "Cada pregunta debe tener una sola respuesta marcada como correcta.",
      };
    }

    // Actualiza el examen conservando su id original
    exams[index] = {
      // Mantiene el id original
      id: exams[index].id,
      // Toma el nuevo código o deja el anterior
      code: updatedData.code ?? exams[index].code,
      // Toma el nuevo título o deja el anterior
      title: updatedData.title ?? exams[index].title,
      // Convierte el tiempo a número
      timeMinutes: Number(updatedData.timeMinutes ?? exams[index].timeMinutes),
      // Convierte el porcentaje a número
      passingScore: Number(updatedData.passingScore ?? exams[index].passingScore),
      // Toma la nueva descripción o deja la anterior
      description: updatedData.description ?? exams[index].description,
      // Guarda las preguntas validadas
      questions: nextQuestions,
    };

    // Guarda los cambios en localStorage
    StorageManager.setItem(EXAMS_KEY, exams);
    // Retorna éxito y el examen actualizado
    return { success: true, exam: exams[index] };
  }

  // Elimina un examen según su id
  static delete(examId) {
    // Obtiene los exámenes actuales
    const exams = this.getAll();
    // Filtra dejando todos menos el examen que tenga examId
    const remainingExams = exams.filter((exam) => exam.id !== examId);

    // Guarda la nueva lista sin el examen eliminado
    StorageManager.setItem(EXAMS_KEY, remainingExams);
    // Retorna éxito
    return { success: true };
  }
}