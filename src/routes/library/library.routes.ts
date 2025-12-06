import {Router} from 'express';
import {isStaff, isAdmin, isAuthenticated} from '@middlewares/auth/admin.middleware';
import {upload} from '@middlewares/upload.middleware';

import {BooksController} from '@controllers/library/books.controller';
import {LoansController} from '@controllers/library/loans.controller';
import {ReportsController} from '@controllers/library/reports.controller';
import {AuthorsController} from '@controllers/library/authors.controller';
import {CategoriesController} from '@controllers/library/categories.controller';

const router = Router();

// Instancias de Controladores
const booksCtrl = new BooksController();
const loansCtrl = new LoansController();
const reportsCtrl = new ReportsController();
const authorsCtrl = new AuthorsController();
const categoriesCtrl = new CategoriesController();


// RUTAS DE GESTIÓN DE AUTORES
// Público: Listar autores (Todos o Busqueda por Query String ?nombre=...)
router.get('/authors', (req, res) => authorsCtrl.getAllAuthors(req, res));
// NUEVO: Público: Obtener autor por ID (Para formularios de edición/detalle)
router.get('/authors/:id', (req, res) => authorsCtrl.getAuthorById(req, res));
// Staff: Crear nuevos autores
router.post('/authors', isStaff, (req, res) => authorsCtrl.createAuthor(req, res));
// Staff: Actualizar autor
router.put('/authors/:id', isStaff, (req, res) => authorsCtrl.updateAuthor(req, res));
// Admin: Eliminar autor (La eliminación es sensible)
router.delete('/authors/:id', isAdmin, (req, res) => authorsCtrl.deleteAuthor(req, res));


// 🏷RUTAS DE GESTIÓN DE CATEGORÍAS (/api/library/categories)
// Público: Listar categorías
router.get('/categories', (req, res) => categoriesCtrl.getAllCategories(req, res));
// Público: Obtener categoría por ID
router.get('/categories/:id', (req, res) => categoriesCtrl.getCategoryById(req, res));
// Staff: Crear nuevas categorías
router.post('/categories', isStaff, (req, res) => categoriesCtrl.createCategory(req, res));
// Staff: Actualizar categoría
router.put('/categories/:id', isStaff, (req, res) => categoriesCtrl.updateCategory(req, res));
// Admin: Eliminar categoría
router.delete('/categories/:id', isAdmin, (req, res) => categoriesCtrl.deleteCategory(req, res));


// RUTAS DE GESTIÓN DE LIBROS
// Público: Ver catálogo (Todos o filtrado por ?titulo=...)
router.get('/books', (req, res) => booksCtrl.getCatalog(req, res));
// Público: Obtener libro por ID (Para formularios de edición/detalle)
router.get('/books/:id', (req, res) => booksCtrl.getBookById(req, res));
// Staff: Crear nuevos libros
router.post('/books', isStaff, upload.single('imagen'), (req, res) => booksCtrl.createBook(req, res));
// Staff: Actualizar libro
router.put('/books/:id', isStaff, upload.single('imagen'), (req, res) => booksCtrl.updateBook(req, res));
// Admin: Eliminar libro
router.delete('/books/:id', isAdmin, (req, res) => booksCtrl.deleteBook(req, res));


// RUTAS DE REPORTES (DASHBOARD) - Solo Admin
// Admin: Top Lectores (VistaTopLectores)
router.get('/reports/top-readers', isAdmin, (req, res) => reportsCtrl.getTopReaders(req, res));

// Admin: Estadística por Categoría (VistaConteoPorCategoria)
router.get('/reports/categories', isAdmin, (req, res) => reportsCtrl.getCategoryStats(req, res));

// Admin: Autores Destacados (sp_ObtenerAutoresTop con parámetro ?min=X)
router.get('/reports/top-authors', isAdmin, (req, res) => reportsCtrl.getTopAuthors(req, res));

router.get('/reports/active-borrowers', isAdmin, (req, res) => reportsCtrl.getActiveBorrowers(req, res));


export default router;