import { Request, Response } from 'express';
import { BooksService } from '@services/library/books.service';
import { CreateBookDTO, UpdateBookDTO } from '@interfaces/library/library.interface';

export class BooksController {
    private service = new BooksService();

    // GET /books
    async getCatalog(req: Request, res: Response) {
        try {
            const searchTerm = req.query.titulo as string | undefined;
            const data = await this.service.getCatalog(searchTerm);
            res.json(data);
        } catch (error: any) {
            res.status(500).json({ message: 'Error obteniendo catálogo', error: error.message });
        }
    }

    // GET /books/:id
    async getBookById(req: Request, res: Response) {
        try {
            const id = parseInt(req.params.id);
            const data = await this.service.getBookById(id);
            res.json(data);
        } catch (error: any) {
            const status = error.message.includes("no encontrado") ? 404 : 500;
            res.status(status).json({ message: 'Error al obtener libro', error: error.message });
        }
    }

    // POST /books (Crear con Imagen)
    async createBook(req: Request, res: Response) {
        try {
            const imagenPath = req.file ? `uploads/${req.file.filename}` : null;

            // Conversión estricta porque CreateBookDTO requiere todos los campos
            const bookData: CreateBookDTO = {
                Titulo: req.body.Titulo,
                ISBN: req.body.ISBN,
                AnioPublicacion: Number(req.body.AnioPublicacion),
                Stock: Number(req.body.Stock),
                AutorID: Number(req.body.AutorID),
                CategoriaID: Number(req.body.CategoriaID),
                ImagenURL: imagenPath
            };

            const newBook = await this.service.createBook(bookData);
            res.status(201).json({ message: 'Libro creado exitosamente', data: newBook });

        } catch (error: any) {
            res.status(400).json({ message: 'Error creando libro', error: error.message });
        }
    }

    // 🚨 PUT /books/:id (ACTUALIZADO: Editar con Imagen)
    async updateBook(req: Request, res: Response) {
        try {
            const id = parseInt(req.params.id);

            // 1. Preparamos el objeto de actualización (Partial)
            const updateData: UpdateBookDTO = {};

            // 2. Solo agregamos al DTO los campos que SÍ vinieron en la petición.
            // Si el frontend no manda 'Stock', no lo tocamos.
            if (req.body.Titulo) updateData.Titulo = req.body.Titulo;
            if (req.body.ISBN) updateData.ISBN = req.body.ISBN;

            // Convertimos a Number solo si el dato existe
            if (req.body.AnioPublicacion) updateData.AnioPublicacion = Number(req.body.AnioPublicacion);
            if (req.body.Stock) updateData.Stock = Number(req.body.Stock);
            if (req.body.AutorID) updateData.AutorID = Number(req.body.AutorID);
            if (req.body.CategoriaID) updateData.CategoriaID = Number(req.body.CategoriaID);

            // 3. Manejo de la Imagen en Edición
            if (req.file) {
                // Si subieron una nueva foto, actualizamos la ruta
                updateData.ImagenURL = `uploads/${req.file.filename}`;
            }
            // NOTA: Si req.file no existe, updateData.ImagenURL se queda undefined
            // y el Repositorio (que ya configuramos antes) NO tocará la columna en la BD.
            // Esto es perfecto: mantiene la foto vieja si no suben una nueva.

            const updatedBook = await this.service.updateBook(id, updateData);

            res.json({ message: 'Libro actualizado exitosamente', data: updatedBook });
        } catch (error: any) {
            const status = error.message.includes("no encontrado") ? 404 : 400;
            res.status(status).json({ message: 'Error al actualizar libro', error: error.message });
        }
    }

    // DELETE /books/:id
    async deleteBook(req: Request, res: Response) {
        try {
            const id = parseInt(req.params.id);
            await this.service.deleteBook(id);
            res.status(204).send();
        } catch (error: any) {
            const status = error.message.includes("No se pudo eliminar") ? 404 : 500;
            res.status(status).json({ message: 'Error al eliminar libro', error: error.message });
        }
    }
}