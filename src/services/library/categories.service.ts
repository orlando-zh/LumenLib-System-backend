// @services/library/categories.service.ts
import { CategoriesRepository } from '@repositories/library/categories.repository';
import { Categoria, CreateCategoryDTO, UpdateCategoryDTO } from '@interfaces/library/library.interface';

export class CategoriesService {
    private repository = new CategoriesRepository();

    async getAllCategories(searchTerm?: string): Promise<Categoria[]> {
        if (searchTerm) {
            return await this.repository.searchByName(searchTerm);
        }
        return await this.repository.getAll();
    }

    async getCategoryById(id: number): Promise<Categoria> {
        const category = await this.repository.getById(id);
        if (!category) {
            throw new Error(`Categoría con ID ${id} no encontrada.`);
        }
        return category;
    }

    async createCategory(data: CreateCategoryDTO): Promise<Categoria> {
        if (!data.NombreCategoria) {
            throw new Error("El nombre de la categoría es obligatorio.");
        }
        return await this.repository.create(data);
    }

    async updateCategory(id: number, data: UpdateCategoryDTO): Promise<Categoria> {
        const updatedCategory = await this.repository.update(id, data);
        if (!updatedCategory) {
            throw new Error(`Categoría con ID ${id} no encontrada o sin datos para actualizar.`);
        }
        return updatedCategory;
    }

    async deleteCategory(id: number): Promise<void> {
        const deleted = await this.repository.delete(id);
        if (!deleted) {
            throw new Error(`No se pudo eliminar la categoría con ID ${id}. Puede que no exista o esté referenciada.`);
        }
    }
}