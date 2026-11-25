# Acme School — Plataforma de Exámenes

Aplicación web desarrollada con **HTML5, CSS3 y JavaScript (ES6 Modules y Web Components)** con persistencia de datos en `localStorage`, diseñada para la gestión de usuarios y exámenes y la presentación pública de evaluaciones con temporizador en tiempo real.

## Características principales

- **Inicio de sesión (`src/auth/`)**: Acceso a los módulos administrativos/docentes mediante correo electrónico y contraseña, con control de sesión y protección de rutas privadas.
- **Gestión de usuarios (`src/modules/`)**: Creación, edición y eliminación de usuarios (`Administrativo` y `Docente`) con validaciones, tabla de registros y actualización en `localStorage`.
- **Gestión de exámenes (`src/exams/`)**: Creación, edición y eliminación de exámenes (código, título, tiempo en minutos, porcentaje de aprobación y descripción) y constructor de preguntas con selección de una única respuesta correcta.
- **Resolución pública de exámenes (`src/takeExam/`)**: Acceso sin inicio de sesión para listar exámenes disponibles, registrar identificación y nombre del estudiante, visualizar encabezado con total de preguntas y porcentaje de aprobación, responder con selección única y contar con un reloj regresivo hasta `00:00` que evalúa automáticamente el resultado y el estado de aprobación.
- **Web Components (`src/components/`)**: Componentes reutilizables construidos con `HTMLElement` y `customElements.define()` (`<acme-navbar>`, `<acme-user-form>`, `<acme-user-table>`, `<acme-exam-card>` y `<acme-timer>`).
- **Estilos y diseño responsive (`styles/`)**: Variables de tema en `themes.css` (fondo azul claro y botones en verde biche) y reglas de diseño adaptable en `main.css`.

## Credenciales iniciales de prueba

- **Administrador**
  - **Correo:** `admin@acmeschool.edu`
  - **Contraseña:** `Admin123*`
- **Docente**
  - **Correo:** `docente@acmeschool.edu`
  - **Contraseña:** `Docente123*`

## Estructura del proyecto

```text
├── index.html
├── README.md
├── styles/
│   ├── themes.css
│   └── main.css
└── src/
    ├── app.js
    ├── auth/
    │   ├── authservice.js
    │   └── loginview.js
    ├── components/
    │   ├── navbar-component.js
    │   ├── user-form-component.js
    │   ├── user-table-component.js
    │   ├── exam-card.js
    │   └── timer-component.js
    ├── data/
    │   └── seeddata.js
    ├── exams/
    │   ├── examsservice.js
    │   └── examsview.js
    ├── modules/
    │   ├── usersservice.js
    │   └── usersview.js
    ├── storage/
    │   └── storagemanager.js
    └── takeExam/
        ├── takeexamservice.js
        └── takeexamview.js