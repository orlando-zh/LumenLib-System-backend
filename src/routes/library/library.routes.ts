import { Router } from 'express';
import { isStaff, isAdmin } from '@middlewares/auth/admin.middleware';

import { BooksController } from '@controllers/library/books.controller';
import { LoansController } from '@controllers/library/loans.controller';
import { ReportsController } from '@controllers/library/reports.controller';
import { AuthorsController } from '@controllers/library/authors.controller';

const router = Router();

// Instancias de Controladores
const booksCtrl = new BooksController();
const loansCtrl = new LoansController();
const reportsCtrl = new ReportsController();
const authorsCtrl = new AuthorsController();


// RUTAS DE GESTIÓN DE AUTORES
// Público: Listar autores (necesario para formularios de creación de libros)
router.get('/authors', (req, res) => authorsCtrl.getAllAuthors(req, res));
// Staff: Crear nuevos autores
router.post('/authors', isStaff, (req, res) => authorsCtrl.createAuthor(req, res));


// RUTAS DE GESTIÓN DE LIBROS
router.get('/books', (req, res) => booksCtrl.getCatalog(req, res));
router.post('/books', isStaff, (req, res) => booksCtrl.createBook(req, res));



// RUTAS DE PRÉSTAMOS
// Staff: Ver préstamos activos/morosos (VistaPrestamosActivos)
router.get('/loans/active', isStaff, (req, res) => loansCtrl.getActiveLoans(req, res));
// Staff: Registrar préstamo (sp_RegistrarPrestamo)
router.post('/loans', isStaff, (req, res) => loansCtrl.createLoan(req, res));



// RUTAS DE REPORTES (DASHBOARD) - Solo Admin
// Admin: Top Lectores (VistaTopLectores)
router.get('/reports/top-readers', isAdmin, (req, res) => reportsCtrl.getTopReaders(req, res));

// Admin: Estadística por Categoría (VistaConteoPorCategoria)
router.get('/reports/categories', isAdmin, (req, res) => reportsCtrl.getCategoryStats(req, res));

// Admin: Autores Destacados (sp_ObtenerAutoresTop con parámetro ?min=X)
router.get('/reports/top-authors', isAdmin, (req, res) => reportsCtrl.getTopAuthors(req, res));

export default router;