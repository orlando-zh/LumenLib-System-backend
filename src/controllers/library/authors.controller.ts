import { Request, Response } from 'express';
import { AuthorsService } from '@services/library/authors.service';

export class AuthorsController {
    private service = new AuthorsService();

    // GET /authors
    async getAllAuthors(req: Request, res: Response) {
        try {
            const data = await this.service.getAllAuthors();
            res.json(data);
        } catch (error: any) {
            res.status(500).json({ message: 'Error al listar autores', error: error.message });
        }
    }

    // POST /authors
    async createAuthor(req: Request, res: Response) {
        try {
            const newAuthor = await this.service.createAuthor(req.body);
            res.status(201).json({ message: 'Autor creado exitosamente', data: newAuthor });
        } catch (error: any) {
            res.status(400).json({ message: 'Error al crear autor', error: error.message });
        }
    }
}