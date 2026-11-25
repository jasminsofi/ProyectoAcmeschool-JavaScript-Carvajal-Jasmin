import { StorageManager } from "../storage/storagemanager.js";
export class AuthService {

    static login(email, password) {

        const users =
            StorageManager.get("users");

        return users.find(
            user =>
                user.email === email &&
                user.password === password
        );

    }

    static saveSession(user) {

        localStorage.setItem(
            "session",
            JSON.stringify(user)
        );

    }

    static getSession() {

        return JSON.parse(
            localStorage.getItem("session")
        );

    }

    static logout() {

        localStorage.removeItem(
            "session"
        );

    }

    static isAuthenticated() {

        return !!this.getSession();

    }

}