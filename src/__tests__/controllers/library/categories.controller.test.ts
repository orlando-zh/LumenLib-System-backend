import request from 'supertest';
import express from 'express';
import { CategoriesController } from '@controllers/library/categories.controller';
import { CategoriesService } from '@services/library/categories.service';

jest.mock('@services/library/categories.service');
const MockedService = CategoriesService as jest.Mock<CategoriesService>;

const app = express();
app.use(express.json());
const controller = new CategoriesController();

app.get('/categories', controller.getAllCategories.bind(controller));
app.get('/categories/:id', controller.getCategoryById.bind(controller));
app.post('/categories', controller.createCategory.bind(controller));
app.put('/categories/:id', controller.updateCategory.bind(controller));
app.delete('/categories/:id', controller.deleteCategory.bind(controller));

describe('CategoriesController', () => {
    let service: jest.Mocked<CategoriesService>;
    const mockCat = { CategoriaID: 1, NombreCategoria: 'A' };

    beforeEach(() => {
        service = new MockedService() as jest.Mocked<CategoriesService>;
        (controller as any).service = service;
        jest.clearAllMocks();
    });

    test('GET /categories devuelve lista', async () => {
        service.getAllCategories.mockResolvedValue([mockCat]);
        await request(app).get('/categories').expect(200);
    });

    test('GET /categories/:id devuelve detalle', async () => {
        service.getCategoryById.mockResolvedValue(mockCat);
        await request(app).get('/categories/1').expect(200);
    });

    test('POST /categories crea', async () => {
        service.createCategory.mockResolvedValue(mockCat);
        await request(app).post('/categories').send(mockCat).expect(201);
    });

    test('PUT /categories/:id actualiza', async () => {
        service.updateCategory.mockResolvedValue(mockCat);
        await request(app).put('/categories/1').send(mockCat).expect(200);
    });

    test('DELETE /categories/:id elimina', async () => {
        service.deleteCategory.mockResolvedValue(undefined);
        await request(app).delete('/categories/1').expect(204);
    });
});