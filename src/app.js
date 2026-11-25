import { seedData }
from "./data/seeddata.js";

import {
    AuthService
}
from "./auth/authservice.js";

seedData();

if(
    location.hash !== "#login" &&
    !AuthService.isAuthenticated()
){

    location.hash = "#login";

}