import express from 'express';
import cors from 'cors';

import { EnvConfig } from './config/app.config';
import usersRoutes from './routes/users/users.routes';
import authRoutes from './routes/auth/auth.routes';
import libraryRoutes from './routes/library/library.routes';

const app = express();

// Middlewares globales
app.use(cors());
app.use(express.json());


// Ruta de prueba principal
app.get('/', (_req, res) => {
    res.send('Servidor LumenLib corriendo');
});

// 1. Autenticación -> /api/auth/login
app.use('/api/auth', authRoutes);

// 2. Usuarios -> /api/users (CORREGIDO: Antes era /usuarios)
app.use('/api/users', usersRoutes);


// 3. Biblioteca -> /api/library/books, /api/library/loans, etc.
app.use('/api/library', libraryRoutes);



// INICIO DEL SERVIDOR
app.get('/config', (_req, res) => {
    res.send("OK");
});

const PORT = EnvConfig.PORT || 4000;

app.listen(PORT, () => {
    console.log(`🚀 Servidor escuchando en http://localhost:${PORT}`);
});
