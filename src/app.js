// Importa SeedData para cargar usuarios y exámenes iniciales si localStorage está vacío
import { SeedData } from "./data/seeddata.js";
// Importa AuthService para revisar si el usuario ya inició sesión
import { AuthService } from "./auth/authservice.js";
// Importa el Web Component de la barra de navegación
import "./components/navbar-component.js";
// Importa las vistas de la aplicación
import { LoginView } from "./auth/loginview.js";
import { UsersView } from "./modules/usersview.js";
import { ExamsView } from "./exams/examsview.js";
import { TakeExamView } from "./takeExam/takeexamview.js";
// Ruta corregida desde ./src/app.js hacia ./src/storage/storagemanager.js
import { StorageManager } from "./storage/storagemanager.js";

// Carga los datos iniciales solo si todavía no hay datos guardados
SeedData.init();

// Obtiene la barra de navegación y el contenedor principal del HTML
const navbar = document.querySelector("#mainNavbar");
const appContainer = document.querySelector("#appContainer");

// Guarda cuál es la vista activa en este momento
let currentView = "take-exam";

// Función que muestra la vista solicitada según el nombre y la sesión
function showView(viewName) {
  // Revisa si hay un usuario autenticado
  const isLoggedIn = AuthService.isAuthenticated();

  // Protege las rutas privadas ("users" y "exams"): si no ha iniciado sesión, manda a "login"
  if ((viewName === "users" || viewName === "exams") && !isLoggedIn) {
    viewName = "login";
  }

  // Actualiza la vista actual
  currentView = viewName;

  // Dibuja la vista correspondiente dentro de #appContainer
  if (viewName === "login") {
    // Crea la vista de Login y le indica qué hacer cuando el ingreso sea correcto
    const loginView = new LoginView(appContainer, () => {
      // Refresca la barra de navegación para mostrar opciones privadas
      if (typeof navbar?.refresh === "function") {
        navbar.refresh();
      }
      // Lleva al usuario a la gestión de exámenes tras iniciar sesión
      showView("exams");
    });
    // Dibuja el formulario de login
    loginView.render();
  } else if (viewName === "users") {
    // Dibuja la vista de gestión de usuarios
    const usersView = new UsersView(appContainer);
    usersView.render();
  } else if (viewName === "exams") {
    // Dibuja la vista de gestión de exámenes
    const examsView = new ExamsView(appContainer);
    examsView.render();
  } else {
    // Por defecto ("take-exam"), muestra la vista pública para resolver exámenes
    currentView = "take-exam";
    const takeExamView = new TakeExamView(appContainer, () => {
      showView("take-exam");
    });
    takeExamView.render();
  }
}

// Escucha cuando el usuario hace clic en un botón de navegación del navbar
if (navbar) {
  navbar.addEventListener("navigate", (event) => {
    // Obtiene el nombre de la vista destino enviada por el navbar
    const targetView = event.detail.view;
    // Muestra esa vista
    showView(targetView);
  });

  // Escucha cuando el usuario cierra sesión desde el navbar
  navbar.addEventListener("logout", () => {
    // Refresca la barra de navegación
    if (typeof navbar?.refresh === "function") {
      navbar.refresh();
    }
    // Regresa a la vista de resolución de exámenes
    showView("take-exam");
  });
}

// Dibuja la vista inicial al abrir la aplicación
showView(currentView);