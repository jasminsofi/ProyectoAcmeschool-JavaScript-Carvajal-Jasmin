import { StorageManager }
from "../storage/storagemanager.js";

export class ExamsService {

    static getAll() {

        return StorageManager.get(
            "exams"
        );

    }

    static create(exam) {

        const exams =
        this.getAll();

        exams.push(exam);

        StorageManager.save(
            "exams",
            exams
        );

    }

    static update(exam) {

        const exams =
        this.getAll();

        const index =
        exams.findIndex(
            e => e.id === exam.id
        );

        exams[index] = exam;

        StorageManager.save(
            "exams",
            exams
        );

    }

    static delete(id) {

        const exams =
        this.getAll();

        const filtered =
        exams.filter(
            exam => exam.id !== id
        );

        StorageManager.save(
            "exams",
            filtered
        );

    }

    static getById(id){

        return this.getAll()
            .find(
                exam => exam.id === id
            );

    }

}