import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { EnvConfig } from '@config/app.config';

export function isAdmin(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ message: 'No autorizado. Token faltante.' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, EnvConfig.JWT_SECRET) as any;

        if (decoded.rol !== 'Admin') {
            return res.status(403).json({ message: 'Acceso denegado. Requiere rol Admin.' });
        }
        req.body.userAuth = decoded;

        next();
    } catch (error) {
        return res.status(401).json({ message: 'Token inválido' });
    }
}




export function isStaff(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: 'Token faltante.' });

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, EnvConfig.JWT_SECRET) as any;

        if (!['Admin', 'Bibliotecario'].includes(decoded.rol)) {
            return res.status(403).json({ message: 'Acceso denegado. Requiere ser personal autorizado.' });
        }

        req.body.userAuth = decoded; // Guardamos quien hace la petición
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Token inválido' });
    }
}



