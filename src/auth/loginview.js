import { AuthService } from "./authservice.js";
const form =
document.querySelector("#loginForm");

form?.addEventListener(
    "submit",
    e => {

        e.preventDefault();

        const email =
            document.querySelector("#email").value;

        const password =
            document.querySelector("#password").value;

        const user =
            AuthService.login(
                email,
                password
            );

        if(user){

            AuthService.saveSession(
                user
            );

            location.hash =
                "#usuarios";

        }else{

            alert(
                "Credenciales incorrectas"
            );

        }

    }
);