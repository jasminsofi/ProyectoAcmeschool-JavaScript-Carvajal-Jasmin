import { StorageManager } from '../storage/storagemanager.js';

export const STORAGE_KEYS = {
  USERS: 'acme_users',
  EXAMS: 'acme_exams',
  SESSION: 'acme_session',
  RESULTS: 'acme_results',
};

const INITIAL_USERS = [
  {
    id: '1001',
    fullName: 'Laura Gómez',
    email: 'admin@acmeschool.edu',
    phone: '3001234567',
    role: 'Administrativo',
    password: 'Admin123*',
  },
  {
    id: '1002',
    fullName: 'Carlos Mendoza',
    email: 'docente@acmeschool.edu',
    phone: '3017654321',
    role: 'Docente',
    password: 'Docente123*',
  },
];

const INITIAL_EXAMS = [
  {
    id: 'exam-1',
    code: 'JS-101',
    title: 'Fundamentos de JavaScript y DOM',
    durationMinutes: 10,
    passingScore: 70,
    description: 'Evalúa conceptos básicos de variables, funciones, arreglos y manipulación del DOM.',
    questions: [
      {
        id: 'q-1',
        text: '¿Qué método convierte un objeto o arreglo de JavaScript a texto JSON?',
        options: [
          { id: 'opt-1', text: 'JSON.parse()', isCorrect: false },
          { id: 'opt-2', text: 'JSON.stringify()', isCorrect: true },
          { id: 'opt-3', text: 'JSON.toText()', isCorrect: false },
        ],
      },
      {
        id: 'q-2',
        text: '¿Qué palabra clave declara una variable cuyo valor no se va a reasignar?',
        options: [
          { id: 'opt-4', text: 'var', isCorrect: false },
          { id: 'opt-5', text: 'let', isCorrect: false },
          { id: 'opt-6', text: 'const', isCorrect: true },
        ],
      },
    ],
  },
];

// Inicializa los datos por defecto solo si aún no existen en localStorage
export function seedInitialData() {
  if (!StorageManager.get(STORAGE_KEYS.USERS)) {
    StorageManager.set(STORAGE_KEYS.USERS, INITIAL_USERS);
  }

  if (!StorageManager.get(STORAGE_KEYS.EXAMS)) {
    StorageManager.set(STORAGE_KEYS.EXAMS, INITIAL_EXAMS);
  }

  if (!StorageManager.get(STORAGE_KEYS.RESULTS)) {
    StorageManager.set(STORAGE_KEYS.RESULTS, []);
  }
}