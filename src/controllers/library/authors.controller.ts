import { Request, Response } from 'express';
import { AuthorsService } from '@services/library/authors.service';

export class AuthorsController {
    private service = new AuthorsService();

    // GET /authors
    async getAllAuthors(req: Request, res: Response) {
        try {
            const searchTerm = req.query.nombre as string | undefined;
            const data = await this.service.getAllAuthors(searchTerm);
            res.json(data);
        } catch (error: any) {
            res.status(500).json({ message: 'Error al listar autores', error: error.message });
        }
    }
    // NUEVO: GET /authors/:id
    async getAuthorById(req: Request, res: Response) {
        try {
            const id = parseInt(req.params.id);
            const data = await this.service.getAuthorById(id);
            res.json(data);
        } catch (error: any) {
            const status = error.message.includes("no encontrado") ? 404 : 500;
            res.status(status).json({ message: 'Error al obtener autor', error: error.message });
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

    // PUT /authors/:id
    async updateAuthor(req: Request, res: Response) {
        try {
            const id = parseInt(req.params.id);
            const updatedAuthor = await this.service.updateAuthor(id, req.body);
            res.json({ message: 'Autor actualizado exitosamente', data: updatedAuthor });
        } catch (error: any) {
            const status = error.message.includes("no encontrado") ? 404 : 400;
            res.status(status).json({ message: 'Error al actualizar autor', error: error.message });
        }
    }

// DELETE /authors/:id
    async deleteAuthor(req: Request, res: Response) {
        try {
            const id = parseInt(req.params.id);
            await this.service.deleteAuthor(id);
            res.status(204).send();
        } catch (error: any) {
            const status = error.message.includes("No se pudo eliminar") ? 404 : 500;
            res.status(status).json({ message: 'Error al eliminar autor', error: error.message });
        }
    }
}