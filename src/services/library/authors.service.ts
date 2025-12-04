import { AuthorsRepository } from '@repositories/library/authors.repository';
import { Autor } from '@interfaces/library/library.interface';

export class AuthorsService {
    private repository = new AuthorsRepository();

    async getAllAuthors() {
        return await this.repository.getAll();
    }

    async createAuthor(data: Autor) {
        if (!data.Nombre) {
            throw new Error("El nombre del autor es obligatorio.");
        }
        return await this.repository.create(data);
    }
}