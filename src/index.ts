import express from 'express';
import cors from 'cors';

import loansRoutes from './routes/loans/loans.routes';
import { EnvConfig } from './config/app.config';
import usersRoutes from './routes/users/users.routes';
import authRoutes from './routes/auth/auth.routes';
import libraryRoutes from './routes/library/library.routes';
import path from 'path';

const app = express();

// Middlewares globales
app.use(cors());
app.use(express.json());


app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use('/api/library/loans', loansRoutes);
app.use('/api/auth', authRoutes);

// Ruta de prueba principal
app.get('/', (_req, res) => {
    res.send('Servidor LumenLib corriendo');
});



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
