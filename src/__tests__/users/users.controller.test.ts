import request from 'supertest';
import express, { Application } from 'express';
import { UsersController } from '@controllers/users/users.controller';
import { UsersService } from '@services/users/users.service';
import { Usuario } from '@interfaces/users/users.interface';

// 1. Mock del Service
jest.mock('@services/users/users.service');
const MockedService = UsersService as jest.Mock<UsersService>;

// 2. Configuración de Express para testing
const app: Application = express();
app.use(express.json());
const controller = new UsersController();

// Mapeo manual de rutas (Replica users.routes.ts sin middlewares de auth para testear lógica pura)
app.get('/users', controller.getAll.bind(controller));
app.get('/users/:id', controller.getById.bind(controller));
app.post('/users', controller.create.bind(controller));
app.put('/users/:id', controller.update.bind(controller));
app.delete('/users/:id', controller.delete.bind(controller));

describe('UsersController (Integration)', () => {
    let service: jest.Mocked<UsersService>;

    const mockUser: Usuario = { UsuarioID: 1, NombreCompleto: 'Test', Email: 't@t.com', Rol: 'Lector' };
    const mockUserWithHash = { ...mockUser, PasswordHash: 'secret' };

    beforeEach(() => {
        service = new MockedService() as jest.Mocked<UsersService>;
        (controller as any).usersService = service;
        jest.clearAllMocks();
    });

    describe('GET /users', () => {
        test('Debe devolver 200 y limpiar hash', async () => {
            // El service devuelve usuarios que PODRÍAN tener hash internamente
            service.getAllUsers.mockResolvedValue([mockUserWithHash]);

            const res = await request(app).get('/users').expect(200);

            // Verificamos que el controller quitó el hash
            expect(res.body[0]).not.toHaveProperty('PasswordHash');
            expect(res.body[0].Email).toBe('t@t.com');
        });

        test('Debe pasar query param al service', async () => {
            service.getAllUsers.mockResolvedValue([]);
            await request(app).get('/users?nombre=juan').expect(200);
            expect(service.getAllUsers).toHaveBeenCalledWith('juan');
        });
    });

    describe('GET /users/:id', () => {
        test('Debe devolver 200 y usuario sin hash', async () => {
            service.getUserById.mockResolvedValue(mockUserWithHash);
            const res = await request(app).get('/users/1').expect(200);
            expect(res.body).not.toHaveProperty('PasswordHash');
        });

        test('Debe devolver 404 si no existe', async () => {
            service.getUserById.mockRejectedValue(new Error('Usuario no encontrado'));
            await request(app).get('/users/99').expect(404);
        });
    });

    describe('POST /users', () => {
        test('Debe devolver 201 al crear', async () => {
            service.createUser.mockResolvedValue(mockUserWithHash);
            await request(app)
                .post('/users')
                .send({ NombreCompleto: 'A', Email: 'B', Password: 'C' })
                .expect(201);
        });

        test('Debe devolver 409 si email duplicado', async () => {
            service.createUser.mockRejectedValue(new Error('email ya está registrado'));
            await request(app)
                .post('/users')
                .send({})
                .expect(409);
        });
    });

    describe('DELETE /users/:id', () => {
        test('Debe devolver 204 si elimina correctamente', async () => {
            service.deleteUser.mockResolvedValue(undefined);
            await request(app).delete('/users/1').expect(204);
        });

        test('Debe devolver 404 si no encuentra usuario', async () => {
            service.deleteUser.mockRejectedValue(new Error('No se pudo eliminar'));
            await request(app).delete('/users/99').expect(404);
        });
    });
});