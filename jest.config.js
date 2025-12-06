/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    rootDir: './', // La raíz del proyecto
    // Esto le dice a Jest dónde están tus archivos de prueba
    testMatch: [
        "**/__tests__/**/*.[jt]s?(x)",
        "**/?(*.)+(spec|test).[jt]s?(x)"
    ],
    // 🚨 ESTO ES CRUCIAL: Mapear tus alias de tsconfig a carpetas reales
    moduleNameMapper: {
        '^@config/(.*)$': '<rootDir>/src/config/$1',
        '^@controllers/(.*)$': '<rootDir>/src/controllers/$1',
        '^@services/(.*)$': '<rootDir>/src/services/$1',
        '^@repositories/(.*)$': '<rootDir>/src/repositories/$1',
        '^@interfaces/(.*)$': '<rootDir>/src/interfaces/$1',
        '^@middlewares/(.*)$': '<rootDir>/src/middlewares/$1'
    },
};