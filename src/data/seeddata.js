import { StorageManager }
from "../storage/storagemanager.js";

export function seedData(){

    const users =
        StorageManager.get(
            "users"
        );

    if(users.length){

        return;

    }

    StorageManager.save(
        "users",
        [
            {

                id: crypto.randomUUID(),

                identificacion:
                "1",

                nombre:
                "Administrador",

                email:
                "admin@acme.com",

                telefono:
                "3000000000",

                cargo:
                "administrativo",

                password:
                "123456"

            }
        ]
    );

}