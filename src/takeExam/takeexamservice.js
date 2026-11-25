import { StorageManager } from '../storage/storagemanager.js';
import { STORAGE_KEYS } from '../data/seeddata.js';
import { ExamsService } from '../exams/examsservice.js';

export class TakeExamService {
  // Obtiene todos los exámenes disponibles para resolver
  static getAvailableExams() {
    return ExamsService.getAll();
  }

  // Valida los datos del estudiante antes de iniciar el examen
  static validateStudent({ studentId, studentName }) {
    const id = String(studentId || '').trim();
    const name = String(studentName || '').trim();

    if (!id || !name) {
      return {
        ok: false,
        message: 'Debes ingresar tu número de identificación y tu nombre completo para comenzar.',
      };
    }

    return {
      ok: true,
      student: { id, name },
    };
  }

  // Evalúa las respuestas seleccionadas y calcula porcentaje y aprobación
  static evaluateAttempt({ exam, student, selectedAnswersByQuestion }) {
    const questions = Array.isArray(exam.questions) ? exam.questions : [];
    const totalQuestions = questions.length;
    let correctCount = 0;

    const detailedAnswers = questions.map((question) => {
      const selectedOptionId = selectedAnswersByQuestion[question.id] || null;
      const correctOption = question.options.find((opt) => Boolean(opt.isCorrect));
      const selectedOption =
        question.options.find((opt) => String(opt.id) === String(selectedOptionId)) || null;

      const isCorrect = Boolean(
        correctOption && selectedOption && String(selectedOption.id) === String(correctOption.id)
      );

      if (isCorrect) {
        correctCount += 1;
      }

      return {
        questionId: question.id,
        questionText: question.text,
        selectedOptionId: selectedOption ? selectedOption.id : null,
        selectedOptionText: selectedOption ? selectedOption.text : 'Sin responder',
        correctOptionText: correctOption ? correctOption.text : '',
        isCorrect,
      };
    });

    const percentage =
      totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 1000) / 10 : 0;
    const passingScore = Number(exam.passingScore) || 0;
    const passed = percentage >= passingScore;

    const attemptRecord = {
      id: `attempt-${Date.now()}`,
      examId: exam.id,
      examTitle: exam.title,
      studentId: student.id,
      studentName: student.name,
      correctCount,
      totalQuestions,
      percentage,
      passingScore,
      passed,
      completedAt: new Date().toISOString(),
      answers: detailedAnswers,
    };

    const existingResults = StorageManager.get(STORAGE_KEYS.RESULTS, []);
    existingResults.push(attemptRecord);
    StorageManager.set(STORAGE_KEYS.RESULTS, existingResults);

    return attemptRecord;
  }
}