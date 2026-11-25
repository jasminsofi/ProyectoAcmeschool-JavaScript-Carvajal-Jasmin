import { StorageManager } from '../storage/storagemanager.js';
import { STORAGE_KEYS } from '../data/seeddata.js';

export class ExamsService {
  // Obtiene todos los exámenes guardados
  static getAll() {
    return StorageManager.get(STORAGE_KEYS.EXAMS, []);
  }

  // Busca un examen por su id
  static getById(id) {
    const exams = this.getAll();
    return exams.find((exam) => String(exam.id) === String(id)) || null;
  }

  // Normaliza una pregunta garantizando que tenga al menos 2 opciones y solo 1 correcta
  static normalizeQuestion(question, index = 0) {
    const text = String(question.text || '').trim();
    const rawOptions = Array.isArray(question.options) ? question.options : [];

    // Buscamos el índice de la primera opción marcada como correcta
    let firstCorrectIndex = rawOptions.findIndex((opt) => Boolean(opt.isCorrect));
    if (firstCorrectIndex === -1 && rawOptions.length > 0) {
      firstCorrectIndex = 0;
    }

    const options = rawOptions.map((opt, optIndex) => ({
      id: opt.id || `opt-${Date.now()}-${index}-${optIndex}`,
      text: String(opt.text || '').trim(),
      // Solo la opción seleccionada en firstCorrectIndex queda como true
      isCorrect: optIndex === firstCorrectIndex,
    }));

    return {
      id: question.id || `q-${Date.now()}-${index}`,
      text,
      options,
    };
  }

  // Valida los datos del examen y sus preguntas
  static validateExam(examData, { isEditing = false, originalId = null } = {}) {
    const code = String(examData.code || '').trim();
    const title = String(examData.title || '').trim();
    const durationMinutes = Number(examData.durationMinutes);
    const passingScore = Number(examData.passingScore);
    const description = String(examData.description || '').trim();
    const rawQuestions = Array.isArray(examData.questions) ? examData.questions : [];

    if (!code || !title || !description) {
      return {
        ok: false,
        message: 'Completa el código, el título y la descripción del examen.',
      };
    }

    if (!Number.isFinite(durationMinutes) || durationMinutes <= 0) {
      return {
        ok: false,
        message: 'El tiempo del examen debe ser un número mayor a 0 minutos.',
      };
    }

    if (!Number.isFinite(passingScore) || passingScore < 1 || passingScore > 100) {
      return {
        ok: false,
        message: 'El porcentaje de aprobación debe estar entre 1 y 100.',
      };
    }

    if (rawQuestions.length === 0) {
      return {
        ok: false,
        message: 'Agrega al menos una pregunta al examen.',
      };
    }

    const normalizedQuestions = [];

    for (let i = 0; i < rawQuestions.length; i++) {
      const q = rawQuestions[i];
      const qText = String(q.text || '').trim();
      const opts = Array.isArray(q.options) ? q.options : [];
      const validOpts = opts.filter((o) => String(o.text || '').trim() !== '');

      if (!qText) {
        return {
          ok: false,
          message: `La pregunta #${i + 1} no tiene enunciado.`,
        };
      }

      if (validOpts.length < 2) {
        return {
          ok: false,
          message: `La pregunta #${i + 1} debe tener al menos 2 respuestas con descripción.`,
        };
      }

      const correctCount = validOpts.filter((o) => Boolean(o.isCorrect)).length;
      if (correctCount !== 1) {
        return {
          ok: false,
          message: `La pregunta #${i + 1} debe tener exactamente una respuesta marcada como correcta.`,
        };
      }

      normalizedQuestions.push(
        this.normalizeQuestion({ ...q, text: qText, options: validOpts }, i)
      );
    }

    // Evita códigos duplicados entre exámenes
    const exams = this.getAll();
    const duplicateCode = exams.some(
      (ex) =>
        ex.code.toLowerCase() === code.toLowerCase() &&
        (!isEditing || String(ex.id) !== String(originalId))
    );

    if (duplicateCode) {
      return {
        ok: false,
        message: `Ya existe un examen con el código "${code}".`,
      };
    }

    return {
      ok: true,
      data: {
        id: isEditing ? originalId : `exam-${Date.now()}`,
        code,
        title,
        durationMinutes,
        passingScore,
        description,
        questions: normalizedQuestions,
      },
    };
  }

  // Crea un nuevo examen
  static create(examData) {
    const validation = this.validateExam(examData, { isEditing: false });
    if (!validation.ok) return validation;

    const exams = this.getAll();
    exams.push(validation.data);
    StorageManager.set(STORAGE_KEYS.EXAMS, exams);

    return { ok: true, exam: validation.data };
  }

  // Actualiza un examen existente
  static update(id, examData) {
    const existing = this.getById(id);
    if (!existing) {
      return { ok: false, message: 'No se encontró el examen a actualizar.' };
    }

    const validation = this.validateExam(examData, {
      isEditing: true,
      originalId: id,
    });
    if (!validation.ok) return validation;

    const updatedExams = this.getAll().map((ex) =>
      String(ex.id) === String(id) ? validation.data : ex
    );
    StorageManager.set(STORAGE_KEYS.EXAMS, updatedExams);

    return { ok: true, exam: validation.data };
  }

  // Elimina un examen por su id
  static remove(id) {
    const exams = this.getAll();
    const filtered = exams.filter((ex) => String(ex.id) !== String(id));

    if (filtered.length === exams.length) {
      return { ok: false, message: 'No se encontró el examen a eliminar.' };
    }

    StorageManager.set(STORAGE_KEYS.EXAMS, filtered);
    return { ok: true };
  }
}