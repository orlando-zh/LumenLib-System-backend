import { Router } from 'express';
import { LoansController } from '@controllers/library/loans.controller';
import { isAuthenticated, isStaff } from '@middlewares/auth/admin.middleware';

const router = Router();
const loansController = new LoansController();

// 1. Realizar Préstamo (POST /) - Acceso: Staff
router.post('/', isAuthenticated, isStaff, (req, res) => loansController.createLoan(req, res));

// 2. Consultar Préstamos Activos (GET /active) - Acceso: Staff
router.get('/active', isAuthenticated, isStaff, (req, res) => loansController.getActiveLoans(req, res));

// 3. Historial Personal (GET /my-history) - Acceso: Autenticado
router.get('/my-history', isAuthenticated, (req, res) => loansController.getMyHistory(req, res));

// 4. Devolver libro por PrestamoID (PUT /api/library/loans/return/:prestamoId)
router.put('/return/:prestamoId', isAuthenticated, isStaff, (req , res ) => loansController.returnByPrestamoId(req, res));

// 5. Devolver libro por UsuarioID + LibroID (PUT /api/library/loans/return)
router.put('/return', isAuthenticated, isStaff, (req, res ) => loansController.returnByUsuarioLibro(req, res));



export default router;