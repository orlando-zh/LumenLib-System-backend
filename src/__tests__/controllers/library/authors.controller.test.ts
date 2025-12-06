import request from 'supertest';
import express from 'express';
import { AuthorsController } from '@controllers/library/authors.controller';
import { AuthorsService } from '@services/library/authors.service';
import { Autor } from '@interfaces/library/library.interface';

jest.mock('@services/library/authors.service');
const MockedService = AuthorsService as jest.Mock<AuthorsService>;

const app = express();
app.use(express.json());
const controller = new AuthorsController();

// Rutas Mockeadas
app.get('/authors', controller.getAllAuthors.bind(controller));
app.get('/authors/:id', controller.getAuthorById.bind(controller));
app.post('/authors', controller.createAuthor.bind(controller));
app.put('/authors/:id', controller.updateAuthor.bind(controller));
app.delete('/authors/:id', controller.deleteAuthor.bind(controller));

describe('AuthorsController', () => {
    let service: jest.Mocked<AuthorsService>;
    const mockAutor: Autor = { AutorID: 1, Nombre: 'Gabo' };

    beforeEach(() => {
        service = new MockedService() as jest.Mocked<AuthorsService>;
        (controller as any).service = service;
        jest.clearAllMocks();
    });

    test('GET /authors devuelve lista', async () => {
        service.getAllAuthors.mockResolvedValue([mockAutor]);
        const res = await request(app).get('/authors').expect(200);
        expect(res.body).toEqual([mockAutor]);
    });

    test('GET /authors/:id devuelve autor', async () => {
        service.getAuthorById.mockResolvedValue(mockAutor);
        const res = await request(app).get('/authors/1').expect(200);
        expect(res.body).toEqual(mockAutor);
    });

    test('GET /authors/:id devuelve 404 si no existe', async () => {
        service.getAuthorById.mockRejectedValue(new Error('no encontrado'));
        await request(app).get('/authors/99').expect(404);
    });

    test('POST /authors crea autor', async () => {
        service.createAuthor.mockResolvedValue(mockAutor);
        await request(app).post('/authors').send({ Nombre: 'Gabo' }).expect(201);
    });

    test('PUT /authors/:id actualiza autor', async () => {
        service.updateAuthor.mockResolvedValue(mockAutor);
        await request(app).put('/authors/1').send({ Nombre: 'New' }).expect(200);
    });

    test('DELETE /authors/:id elimina autor', async () => {
        service.deleteAuthor.mockResolvedValue(undefined);
        await request(app).delete('/authors/1').expect(204);
    });
});