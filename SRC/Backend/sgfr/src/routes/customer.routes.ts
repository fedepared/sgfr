import { Router } from 'express';
import { customerController } from '../controllers/customer.controller';
import { authenticate, authorize } from '../middlewares/auth';

const router = Router();

// Todas las rutas de clientes requieren estar autenticado
router.use(authenticate);

/**
 * @openapi
 * /api/customers:
 *   get:
 *     summary: Listar clientes con paginación y búsqueda
 *     tags:
 *       - Clientes
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
 *         description: Cantidad de clientes por página
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Búsqueda por DNI/CUIT, nombre o apellido
 *     responses:
 *       200:
 *         description: Listado paginado de clientes.
 *       401:
 *         description: No autenticado.
 */
router.get('/', (req, res, next) => customerController.getAll(req, res, next));

/**
 * @openapi
 * /api/customers/{id}:
 *   get:
 *     summary: Obtener el detalle de un cliente por ID
 *     tags:
 *       - Clientes
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de MongoDB del cliente
 *     responses:
 *       200:
 *         description: Datos detallados del cliente.
 *       400:
 *         description: ID inválido.
 *       401:
 *         description: No autenticado.
 *       404:
 *         description: Cliente no encontrado.
 */
router.get('/:id', (req, res, next) => customerController.getById(req, res, next));

/**
 * @openapi
 * /api/customers:
 *   post:
 *     summary: Registrar un nuevo cliente (solo coordinador)
 *     tags:
 *       - Clientes
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
 *               - addresses
 *             properties:
 *               name:
 *                 type: string
 *                 example: Distribuidora Norte
 *               lastName:
 *                 type: string
 *                 example: SRL
 *               idCard:
 *                 type: number
 *                 example: 30712345678
 *               addresses:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - street
 *                   properties:
 *                     street:
 *                       type: string
 *                       example: Av. Cabildo 2040
 *                     zipCode:
 *                       type: string
 *                       example: 1428
 *                     floor:
 *                       type: number
 *                       example: 2
 *                     dept:
 *                       type: string
 *                       example: A
 *     responses:
 *       201:
 *         description: Cliente registrado exitosamente.
 *       400:
 *         description: Datos requeridos faltantes o inválidos.
 *       401:
 *         description: No autenticado.
 *       403:
 *         description: Requiere rol coordinador.
 *       409:
 *         description: El DNI/CUIT ya está registrado.
 */
router.post('/', authorize('coordinador'), (req, res, next) => customerController.create(req, res, next));

/**
 * @openapi
 * /api/customers/{id}:
 *   put:
 *     summary: Modificar datos de un cliente (solo coordinador)
 *     tags:
 *       - Clientes
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del cliente
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Distribuidora Norte
 *               lastName:
 *                 type: string
 *                 example: SA
 *               idCard:
 *                 type: number
 *                 example: 30712345678
 *               addresses:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     street:
 *                       type: string
 *                       example: Av. Cabildo 2050
 *                     zipCode:
 *                       type: string
 *                       example: 1428
 *                     floor:
 *                       type: number
 *                       example: 3
 *                     dept:
 *                       type: string
 *                       example: B
 *     responses:
 *       200:
 *         description: Cliente actualizado exitosamente.
 *       400:
 *         description: Datos o ID inválidos.
 *       401:
 *         description: No autenticado.
 *       403:
 *         description: Requiere rol coordinador.
 *       404:
 *         description: Cliente no encontrado.
 *       409:
 *         description: El DNI/CUIT ya está en uso por otro cliente.
 */
router.put('/:id', authorize('coordinador'), (req, res, next) => customerController.update(req, res, next));

/**
 * @openapi
 * /api/customers/{id}:
 *   delete:
 *     summary: Eliminar un cliente (solo coordinador)
 *     tags:
 *       - Clientes
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del cliente a eliminar
 *     responses:
 *       200:
 *         description: Cliente eliminado con éxito.
 *       400:
 *         description: ID inválido.
 *       401:
 *         description: No autenticado.
 *       403:
 *         description: Requiere rol coordinador.
 *       404:
 *         description: Cliente no encontrado.
 */
router.delete('/:id', authorize('coordinador'), (req, res, next) => customerController.delete(req, res, next));

export default router;
