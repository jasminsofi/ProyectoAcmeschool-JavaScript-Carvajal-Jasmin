import { StorageManager }
from "../storage/storagemanager.js";

export class UsersService {

    static getAll() {

        return StorageManager.get(
            "users"
        );

    }

    static create(user){

        const users =
            this.getAll();

        users.push(user);

        StorageManager.save(
            "users",
            users
        );

    }

    static update(user){

        const users =
            this.getAll();

        const index =
            users.findIndex(
                u => u.id === user.id
            );

        users[index] = user;

        StorageManager.save(
            "users",
            users
        );

    }

    static delete(id){

        const users =
            this.getAll()
                .filter(
                    user =>
                    user.id !== id
                );

        StorageManager.save(
            "users",
            users
        );

    }

}