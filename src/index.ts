import express from 'express';
import cors from 'cors';


import { EnvConfig } from './config/app.config';
import usersRoutes from './routes/users/users.routes';

const app = express();

// Middlewares globales
app.use(cors());
app.use(express.json());



// Ruta de prueba principal
app.get('/', (_req, res) => {
    res.send('Servidor LumenLib corriendo');
});

// Rutas de usuarios
app.use('/usuarios', usersRoutes);


// Ruta para verificar configuración
app.get('/config', (_req, res) => {
    res.send("OK");
});

// Puerto desde variables de entorno
const PORT = EnvConfig.PORT || 3000;

app.listen(PORT, () => {
    console.log(`🚀 Servidor escuchando en http://localhost:${PORT}`);
});
