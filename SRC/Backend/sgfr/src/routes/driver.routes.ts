import { Router } from 'express';
import { driverController } from '../controllers/driver.controller';
import { authenticate, authorize } from '../middlewares/auth';

const router = Router();

// Todas las rutas de choferes requieren estar autenticado
router.use(authenticate);

/**
 * @openapi
 * /api/drivers/license-types:
 *   get:
 *     summary: Obtener el catálogo de tipos de licencia
 *     tags:
 *       - Choferes
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de tipos de licencia disponibles.
 *       401:
 *         description: No autenticado.
 */
router.get('/license-types', (req, res, next) => driverController.getLicenseTypes(req, res, next));

/**
 * @openapi
 * /api/drivers:
 *   get:
 *     summary: Listar choferes con paginación y filtros
 *     tags:
 *       - Choferes
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Número de página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Cantidad de choferes por página
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Búsqueda por DNI, nombre o apellido
 *       - in: query
 *         name: licenseType
 *         schema:
 *           type: string
 *         description: ID de tipo de licencia
 *     responses:
 *       200:
 *         description: Listado paginado de choferes.
 *       401:
 *         description: No autenticado.
 */
router.get('/', (req, res, next) => driverController.getAll(req, res, next));

/**
 * @openapi
 * /api/drivers/{id}:
 *   get:
 *     summary: Obtener el detalle de un chofer por ID
 *     tags:
 *       - Choferes
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de MongoDB del chofer
 *     responses:
 *       200:
 *         description: Datos detallados del chofer.
 *       400:
 *         description: ID inválido.
 *       401:
 *         description: No autenticado.
 *       404:
 *         description: Chofer no encontrado.
 */
router.get('/:id', (req, res, next) => driverController.getById(req, res, next));

/**
 * @openapi
 * /api/drivers:
 *   post:
 *     summary: Dar de alta un nuevo chofer (solo coordinador)
 *     tags:
 *       - Choferes
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - lastName
 *               - idCard
 *               - licenseType
 *             properties:
 *               name:
 *                 type: string
 *                 example: Roberto
 *               lastName:
 *                 type: string
 *                 example: Gómez
 *               idCard:
 *                 type: number
 *                 example: 32456789
 *               licenseType:
 *                 type: string
 *                 description: ID de MongoDB de LicenseType
 *                 example: 671ff8890123456789abcdef
 *               user:
 *                 type: string
 *                 description: ID de MongoDB de un usuario existente opcional
 *                 example: 671ff8890123456789abcde0
 *               createAccount:
 *                 type: object
 *                 description: Opcional. Crea automáticamente el usuario y lo asocia
 *                 properties:
 *                   userName:
 *                     type: string
 *                     example: chofer_roberto
 *                   password:
 *                     type: string
 *                     example: roberto123
 *     responses:
 *       201:
 *         description: Chofer registrado exitosamente.
 *       400:
 *         description: Datos requeridos faltantes o inválidos.
 *       401:
 *         description: No autenticado.
 *       403:
 *         description: Requiere rol coordinador.
 *       409:
 *         description: El DNI o usuario ya está registrado.
 */
router.post('/', authorize('coordinador'), (req, res, next) => driverController.create(req, res, next));

/**
 * @openapi
 * /api/drivers/{id}:
 *   put:
 *     summary: Modificar datos de un chofer (solo coordinador)
 *     tags:
 *       - Choferes
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del chofer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Roberto Carlos
 *               lastName:
 *                 type: string
 *                 example: Gómez
 *               idCard:
 *                 type: number
 *                 example: 32456789
 *               licenseType:
 *                 type: string
 *                 example: 671ff8890123456789abcdef
 *               user:
 *                 type: string
 *                 nullable: true
 *                 description: ID de MongoDB de la cuenta o null para desvincular
 *     responses:
 *       200:
 *         description: Chofer actualizado exitosamente.
 *       400:
 *         description: Datos o ID inválidos.
 *       401:
 *         description: No autenticado.
 *       403:
 *         description: Requiere rol coordinador.
 *       404:
 *         description: Chofer no encontrado.
 *       409:
 *         description: El DNI ya pertenece a otro chofer o la cuenta ya está vinculada.
 */
router.put('/:id', authorize('coordinador'), (req, res, next) => driverController.update(req, res, next));

/**
 * @openapi
 * /api/drivers/{id}:
 *   delete:
 *     summary: Eliminar un chofer (solo coordinador)
 *     tags:
 *       - Choferes
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del chofer a eliminar
 *     responses:
 *       200:
 *         description: Chofer eliminado con éxito.
 *       400:
 *         description: ID inválido.
 *       401:
 *         description: No autenticado.
 *       403:
 *         description: Requiere rol coordinador.
 *       404:
 *         description: Chofer no encontrado.
 */
router.delete('/:id', authorize('coordinador'), (req, res, next) => driverController.delete(req, res, next));

export default router;
