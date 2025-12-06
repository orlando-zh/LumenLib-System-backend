import { BooksRepository } from '@repositories/library/books.repository';
import { Libro, CreateBookDTO, UpdateBookDTO } from '@interfaces/library/library.interface';

export class BooksService {
    private repository = new BooksRepository();

    async getCatalog(searchTerm?: string) {
        if (searchTerm) {
            return await this.repository.searchByTitle(searchTerm);
        }
        return await this.repository.getAllCatalog();
    }

    async getBookById(id: number): Promise<Libro> {
        const book = await this.repository.getById(id);
        if (!book) {
            throw new Error(`Libro con ID ${id} no encontrado.`);
        }
        return book;
    }

    // FUNCIÓN CREATEBOOK IMPLEMENTADA
    async createBook(data: CreateBookDTO) {
        if(data.Stock < 0) throw new Error("El stock no puede ser negativo");

        return await this.repository.createBook(data);
    }

    //  Actualizar Libro
    async updateBook(id: number, data: UpdateBookDTO) {
        if(data.Stock && data.Stock < 0) throw new Error("El stock no puede ser negativo");

        const updatedBook = await this.repository.updateBook(id, data);
        if (!updatedBook) {
            throw new Error(`Libro con ID ${id} no encontrado o sin datos para actualizar.`);
        }
        return updatedBook;
    }

    // Eliminar Libro
    async deleteBook(id: number): Promise<void> {
        const deleted = await this.repository.deleteBook(id);
        if (!deleted) {
            throw new Error(`No se pudo eliminar el libro con ID ${id}. Puede que no exista o esté referenciado por un préstamo activo.`);
        }
    }
}