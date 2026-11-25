import { seedInitialData } from './data/seeddata.js';
import { AuthService } from './auth/authservice.js';
import { LoginView } from './auth/loginview.js';
import { UsersView } from './modules/usersview.js';
import { ExamsView } from './exams/examsview.js';
import { TakeExamView } from './takeExam/takeexamview.js';
import './components/navbar-component.js';

class AcmeApp {
  constructor() {
    this.navbar = document.querySelector('acme-navbar');
    this.viewContainer = document.querySelector('#appView');

    // Si hay sesión activa abre en 'exams'; si no, inicia directamente en 'login'
    this.currentRoute = AuthService.isAuthenticated() ? 'exams' : 'login';
  }

  init() {
    seedInitialData();
    this._bindGlobalEvents();
    this.renderCurrentRoute();
  }

  _bindGlobalEvents() {
    document.addEventListener('navigate', (event) => {
      const targetRoute = event.detail.route;
      this.navigateTo(targetRoute);
    });

    document.addEventListener('logout', () => {
      AuthService.logout();
      this.currentRoute = 'login';
      this.renderCurrentRoute();
    });
  }

  navigateTo(route) {
    const privateRoutes = ['users', 'exams'];

    // Bloquea acceso a módulos privados si no hay sesión iniciada
    if (privateRoutes.includes(route) && !AuthService.isAuthenticated()) {
      this.currentRoute = 'login';
    } else {
      this.currentRoute = route;
    }

    this.renderCurrentRoute();
  }

  renderCurrentRoute() {
    const currentUser = AuthService.getCurrentUser();

    if (this.navbar) {
      this.navbar.setState({
        user: currentUser,
        activeRoute: this.currentRoute,
      });
    }

    if (!this.viewContainer) return;

    switch (this.currentRoute) {
      case 'login': {
        const loginView = new LoginView(this.viewContainer, () => {
          this.currentRoute = 'exams';
          this.renderCurrentRoute();
        });
        loginView.render();
        break;
      }

      case 'users': {
        const usersView = new UsersView(this.viewContainer);
        usersView.render();
        break;
      }

      case 'exams': {
        const examsView = new ExamsView(this.viewContainer);
        examsView.render();
        break;
      }

      case 'take-exam':
      default: {
        const takeExamView = new TakeExamView(this.viewContainer);
        takeExamView.render();
        break;
      }
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const app = new AcmeApp();
  app.init();
});