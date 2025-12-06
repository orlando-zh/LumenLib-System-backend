import request from 'supertest';
import express, { Request, Response, NextFunction } from 'express';
import { BooksController } from '@controllers/library/books.controller';
import { BooksService } from '@services/library/books.service';
import { Libro } from '@interfaces/library/library.interface';

// 1. Mock del Servicio
jest.mock('@services/library/books.service');
const MockedService = BooksService as jest.Mock<BooksService>;

// 2. Configuración de Express para Pruebas
const app = express();
app.use(express.json());

// 🚨 MIDDLEWARE FALSO DE MULTER (Simulación)
// Como en unit tests no subimos archivos reales, este middleware inyecta
// un objeto 'req.file' falso si detecta un header especial.
app.use((req: any, res: Response, next: NextFunction) => {
    if (req.headers['x-mock-file']) {
        req.file = {
            filename: 'test-image.jpg',
            mimetype: 'image/jpeg',
            size: 1024
        };
    }
    next();
});

const controller = new BooksController();

// Mapeo de rutas
app.get('/books', controller.getCatalog.bind(controller));
app.get('/books/:id', controller.getBookById.bind(controller));
app.post('/books', controller.createBook.bind(controller));
app.put('/books/:id', controller.updateBook.bind(controller));
app.delete('/books/:id', controller.deleteBook.bind(controller));

describe('BooksController', () => {
    let service: jest.Mocked<BooksService>;

    // Objeto mock que espera el servicio
    const mockBook = {
        LibroID: 1,
        Titulo: 'Vue',
        Stock: 10,
        ImagenURL: 'uploads/test-image.jpg'
    } as Libro;

    beforeEach(() => {
        service = new MockedService() as jest.Mocked<BooksService>;
        (controller as any).service = service;
        jest.clearAllMocks();
    });

    // --- TESTS ---

    test('GET /books retorna lista', async () => {
        service.getCatalog.mockResolvedValue([mockBook as any]);
        await request(app).get('/books').expect(200);
        expect(service.getCatalog).toHaveBeenCalled();
    });

    test('GET /books/:id retorna libro', async () => {
        service.getBookById.mockResolvedValue(mockBook);
        await request(app).get('/books/1').expect(200);
        expect(service.getBookById).toHaveBeenCalledWith(1);
    });

    // 🚨 PRUEBA DE CREACIÓN CON IMAGEN Y CONVERSIÓN DE DATOS
    test('POST /books procesa imagen y convierte strings a números', async () => {
        service.createBook.mockResolvedValue(mockBook);

        await request(app)
            .post('/books')
            .set('x-mock-file', 'true') // Activamos el mock de archivo
            // Enviamos todo como strings para simular FormData
            .send({
                Titulo: 'Vue',
                ISBN: '123',
                Stock: '10',           // String
                AnioPublicacion: '2024', // String
                AutorID: '1',          // String
                CategoriaID: '2'       // String
            })
            .expect(201);

        // Verificamos que al servicio llegaron NÚMEROS y la ruta de la IMAGEN
        expect(service.createBook).toHaveBeenCalledWith(expect.objectContaining({
            Titulo: 'Vue',
            Stock: 10,              // Se convirtió correctamente
            AnioPublicacion: 2024,  // Se convirtió correctamente
            ImagenURL: 'uploads/test-image.jpg' // Se asignó la ruta
        }));
    });

    test('POST /books retorna 400 si falla el servicio', async () => {
        service.createBook.mockRejectedValue(new Error('stock no puede ser negativo'));

        const res = await request(app)
            .post('/books')
            .send({ Stock: -1 })
            .expect(400);

        expect(res.body.message).toContain('Error creando libro');
    });

    test('PUT /books/:id actualiza con imagen', async () => {
        service.updateBook.mockResolvedValue(mockBook);

        await request(app)
            .put('/books/1')
            .set('x-mock-file', 'true') // Enviamos nueva imagen
            .send({ Titulo: 'Vue Updated' })
            .expect(200);

        expect(service.updateBook).toHaveBeenCalledWith(1, expect.objectContaining({
            Titulo: 'Vue Updated',
            ImagenURL: 'uploads/test-image.jpg'
        }));
    });

    test('DELETE /books/:id retorna 204', async () => {
        service.deleteBook.mockResolvedValue(undefined);
        await request(app).delete('/books/1').expect(204);
        expect(service.deleteBook).toHaveBeenCalledWith(1);
    });
});