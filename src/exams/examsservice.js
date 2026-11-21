// traer StorageManager para guardar y leer los examenes en localStorage
import { StorageManager } from "../storage/storagemanager.js";

// Clave donde se guardan los examenes en localStorage
const EXAMS_KEY = "acmeschool_exams";

// Clase con las operaciones para gestionar examenes
export class ExamsService {
  // Devuelve todos los examenes guardados o uno vacio si no hay ninguno 
  static getAll() {
    // Lee la lista de examenes desde localStorage
    return StorageManager.getItem(EXAMS_KEY, []);
  }

  // Busca un examen por su id
  static getById(examId) {
    // Obtiene todos los examenes
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
      // Cuenta cuantas opciones tienen isCorrect en true
      const correctCount = options.filter((opt) => opt.isCorrect === true).length;

      // El enunciado pide que cada pregunta tenga solo una respuesta correcta
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

    // Verifica que las preguntas tengan una sola respuesta correcta
    if (!this.hasValidQuestions(examData.questions)) {
      // Retorna error si no cumple esa regla
      return {
        success: false,
        message: "Cada pregunta debe tener una sola respuesta marcada como correcta.",
      };
    }

    // Crea el objeto del examen con un id sencillo
    const newExam = {
      // Genera un id unico simple
      id: "exam-" + Date.now(),
      // Código del examen
      code: examData.code,
      // Titulo del examen
      title: examData.title,
      // Tiempo en minutos
      timeMinutes: Number(examData.timeMinutes),
      // Porcentaje minimo para aprobar
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

    // Valida las preguntas si vienen en updatedData par que tengan solo una respuesta correcta 
    if (updatedData.questions && !this.hasValidQuestions(updatedData.questions)) {
      // Retorna error si no tiene exactamente una respuesta correcta por pregunta
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
      // Toma las nuevas preguntas o deja las anteriores
      questions: updatedData.questions ?? exams[index].questions,
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