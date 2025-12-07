export class AppError extends Error {
    public readonly statusCode: number;
    public readonly isOperational: boolean;

    constructor(message: string, statusCode: number) {
        super(message);
        this.statusCode = statusCode;
        // isOperational true significa que es un error controlado por nosotros (validación, etc)
        // false sería un bug de programación o error de sistema
        this.isOperational = true;

        // Captura el stack trace (útil para debug)
        Error.captureStackTrace(this, this.constructor);
    }
}