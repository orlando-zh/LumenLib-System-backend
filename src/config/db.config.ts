import sql from 'mssql';
import { EnvConfig } from './app.config';

const config: sql.config = {
    user: EnvConfig.DB.USER,
    password: EnvConfig.DB.PASSWORD,
    server: EnvConfig.DB.HOST,
    database: EnvConfig.DB.DATABASE,
    port: EnvConfig.DB.PORT,
    options: {
        encrypt: false,
        trustServerCertificate: true
    }
};

export const dbPool = new sql.ConnectionPool(config)
    .connect()
    .then(pool => {
        console.log('Conectado a SQL Server');
        return pool;
    })
    .catch(err => {
        console.error('Error de conexión a SQL Server:', err);
        throw err;
    });
