import { BooksRepository } from '@repositories/library/books.repository';
import { Libro } from '@interfaces/library/library.interface';

export class BooksService {
    private repository = new BooksRepository();

    async getCatalog() {
        return await this.repository.getAllCatalog();
    }

    async createBook(data: Libro) {
        // Validaciones extra podrían ir aquí
        if(data.Stock < 0) throw new Error("El stock no puede ser negativo");
        return await this.repository.createBook(data);
    }
}