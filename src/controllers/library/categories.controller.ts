import { Request, Response } from 'express';
import { CategoriesService } from '@services/library/categories.service';

export class CategoriesController {
    private service = new CategoriesService();

    // GET /categories
    async getAllCategories(req: Request, res: Response) {
        try {
            const searchTerm = req.query.nombre as string | undefined;

            const data = await this.service.getAllCategories(searchTerm);

            res.json(data);
        } catch (error: any) {
            res.status(500).json({ message: 'Error al listar categorías', error: error.message });
        }
    }

    // GET /categories/:id
    async getCategoryById(req: Request, res: Response) {
        try {
            const id = parseInt(req.params.id);
            const data = await this.service.getCategoryById(id);
            res.json(data);
        } catch (error: any) {
            const status = error.message.includes("no encontrada") ? 404 : 500;
            res.status(status).json({ message: 'Error al obtener categoría', error: error.message });
        }
    }

    // POST /categories
    async createCategory(req: Request, res: Response) {
        try {
            const newCategory = await this.service.createCategory(req.body);
            res.status(201).json({ message: 'Categoría creada exitosamente', data: newCategory });
        } catch (error: any) {
            res.status(400).json({ message: 'Error al crear categoría', error: error.message });
        }
    }

    // PUT /categories/:id
    async updateCategory(req: Request, res: Response) {
        try {
            const id = parseInt(req.params.id);
            const updatedCategory = await this.service.updateCategory(id, req.body);
            res.json({ message: 'Categoría actualizada exitosamente', data: updatedCategory });
        } catch (error: any) {
            // 404 para errores de "no encontrado" específicos
            const status = error.message.includes("no encontrada") ? 404 : 400;
            res.status(status).json({ message: 'Error al actualizar categoría', error: error.message });
        }
    }

    // DELETE /categories/:id
    async deleteCategory(req: Request, res: Response) {
        try {
            const id = parseInt(req.params.id);
            await this.service.deleteCategory(id);
            res.status(204).send(); // 204 No Content para eliminación exitosa
        } catch (error: any) {
            // 404 si el elemento no existía
            const status = error.message.includes("No se pudo eliminar") ? 404 : 500;
            res.status(status).json({ message: 'Error al eliminar categoría', error: error.message });
        }
    }
}