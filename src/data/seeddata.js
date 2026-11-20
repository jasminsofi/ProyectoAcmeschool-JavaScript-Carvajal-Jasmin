export const initialExams = [
  {
    id: "exam-1",
    code: "MAT-101",
    title: "Matemáticas Básicas",
    timeMinutes: 10,
    passingScore: 70,
    description: "Evaluación corta de operaciones y lógica numérica.",
    questions: [
      {
        id: "q-1",
        text: "¿Cuánto es 15 + 25?",
        options: [
          { id: "opt-1", description: "30", isCorrect: false },
          { id: "opt-2", description: "40", isCorrect: true },
          { id: "opt-3", description: "45", isCorrect: false }
        ]
      },
      {
        id: "q-2",
        text: "¿Cuál es el resultado de 8 x 3?",
        options: [
          { id: "opt-4", description: "24", isCorrect: true },
          { id: "opt-5", description: "16", isCorrect: false },
          { id: "opt-6", description: "32", isCorrect: false }
        ]
      }
    ]
  }
];