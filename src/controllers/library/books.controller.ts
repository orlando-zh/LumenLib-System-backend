import { Request, Response } from 'express';
import { BooksService } from '@services/library/books.service';

export class BooksController {
    private service = new BooksService();

    async getCatalog(req: Request, res: Response) {
        try {
            const data = await this.service.getCatalog();
            res.json(data);
        } catch (error: any) {
            res.status(500).json({ message: 'Error obteniendo catálogo', error: error.message });
        }
    }

    async createBook(req: Request, res: Response) {
        try {
            const newBook = await this.service.createBook(req.body);
            res.status(201).json({ message: 'Libro creado', data: newBook });
        } catch (error: any) {
            res.status(400).json({ message: 'Error creando libro', error: error.message });
        }
    }
}