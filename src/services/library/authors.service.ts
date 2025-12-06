import { AuthorsRepository } from '@repositories/library/authors.repository';
import { Autor, CreateAuthorDTO, UpdateAuthorDTO } from '@interfaces/library/library.interface';

export class AuthorsService {
    private repository = new AuthorsRepository();

    async getAllAuthors(searchTerm?: string): Promise<Autor[]> {
        if (searchTerm) {
            return await this.repository.searchByName(searchTerm);
        }
        return await this.repository.getAll();
    }

    async getAuthorById(id: number): Promise<Autor> {
        const author = await this.repository.getById(id);
        if (!author) {
            throw new Error(`Autor con ID ${id} no encontrado.`);
        }
        return author;
    }

    async createAuthor(data: Autor) {
        if (!data.Nombre) {
            throw new Error("El nombre del autor es obligatorio.");
        }
        return await this.repository.create(data);
    }

    async updateAuthor(id: number, data: UpdateAuthorDTO): Promise<Autor> {
        const updatedAuthor = await this.repository.update(id, data);
        if (!updatedAuthor) {
            throw new Error(`Autor con ID ${id} no encontrado o sin datos para actualizar.`);
        }
        return updatedAuthor;
    }


    async deleteAuthor(id: number): Promise<void> {
        const deleted = await this.repository.delete(id);
        if (!deleted) {
            throw new Error(`No se pudo eliminar el autor con ID ${id}. Puede que no exista o esté referenciado por un libro.`);
        }
    }
}