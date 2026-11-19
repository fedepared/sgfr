import { Router } from 'express';
import { deliveryController } from '../controllers/delivery.controller';
import { authenticate, authorize } from '../middlewares/auth';

const router = Router();

// Todas las rutas de entregas requieren estar autenticado
router.use(authenticate);

/**
 * @openapi
 * /api/deliveries:
 *   get:
 *     summary: Listar entregas con paginación y filtros
 *     tags:
 *       - Entregas
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
 *         description: Cantidad de entregas por página
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [Creado, En Preparación, En camino, Entregado, Fallo en la entrega]
 *         description: Filtrar por estado de la entrega
 *       - in: query
 *         name: customer
 *         schema:
 *           type: string
 *         description: ID de MongoDB del cliente
 *       - in: query
 *         name: timeRange
 *         schema:
 *           type: string
 *           enum: [8:00 a 13:00, 13:00 a 18:00, 18:00 a 23:00]
 *         description: Filtrar por franja horaria
 *     responses:
 *       200:
 *         description: Listado paginado de entregas.
 *       401:
 *         description: No autenticado.
 */
router.get('/', (req, res, next) => deliveryController.getAll(req, res, next));

/**
 * @openapi
 * /api/deliveries/{id}:
 *   get:
 *     summary: Obtener el detalle de una entrega por ID
 *     tags:
 *       - Entregas
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de MongoDB de la entrega
 *     responses:
 *       200:
 *         description: Detalle de la entrega con cliente populado y anotaciones.
 *       400:
 *         description: ID inválido.
 *       401:
 *         description: No autenticado.
 *       404:
 *         description: Entrega no encontrada.
 */
router.get('/:id', (req, res, next) => deliveryController.getById(req, res, next));

/**
 * @openapi
 * /api/deliveries:
 *   post:
 *     summary: Dar de alta una entrega independiente (solo coordinador)
 *     tags:
 *       - Entregas
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - customer
 *               - address
 *               - timeRange
 *               - distance
 *             properties:
 *               customer:
 *                 type: string
 *                 description: ID de MongoDB del cliente
 *                 example: 671ff8890123456789abcde1
 *               address:
 *                 type: string
 *                 example: Av. Corrientes 3450, Piso 7 B
 *               timeRange:
 *                 type: string
 *                 enum: [8:00 a 13:00, 13:00 a 18:00, 18:00 a 23:00]
 *                 example: 8:00 a 13:00
 *               status:
 *                 type: string
 *                 enum: [Creado, En Preparación, En camino, Entregado, Fallo en la entrega]
 *                 default: Creado
 *               distance:
 *                 type: number
 *                 example: 10.5
 *     responses:
 *       201:
 *         description: Entrega creada con éxito.
 *       400:
 *         description: Datos requeridos faltantes o inválidos.
 *       401:
 *         description: No autenticado.
 *       403:
 *         description: Requiere rol coordinador.
 *       404:
 *         description: Cliente no encontrado.
 */
router.post('/', authorize('coordinador'), (req, res, next) => deliveryController.create(req, res, next));

/**
 * @openapi
 * /api/deliveries/{id}:
 *   put:
 *     summary: Modificar datos de una entrega (solo coordinador)
 *     tags:
 *       - Entregas
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la entrega
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               address:
 *                 type: string
 *                 example: Av. Corrientes 3480
 *               timeRange:
 *                 type: string
 *                 enum: [8:00 a 13:00, 13:00 a 18:00, 18:00 a 23:00]
 *               distance:
 *                 type: number
 *                 example: 11.2
 *     responses:
 *       200:
 *         description: Entrega actualizada con éxito.
 *       400:
 *         description: Datos o ID inválidos.
 *       401:
 *         description: No autenticado.
 *       403:
 *         description: Requiere rol coordinador.
 *       404:
 *         description: Entrega no encontrada.
 */
router.put('/:id', authorize('coordinador'), (req, res, next) => deliveryController.update(req, res, next));

/**
 * @openapi
 * /api/deliveries/{id}/status:
 *   patch:
 *     summary: Actualizar estado de una entrega y opcionalmente dejar observación (chofer / coordinador)
 *     tags:
 *       - Entregas
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la entrega
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [Creado, En Preparación, En camino, Entregado, Fallo en la entrega]
 *                 example: Entregado
 *               observation:
 *                 type: string
 *                 example: Entregado en mano y firmado
 *     responses:
 *       200:
 *         description: Estado actualizado exitosamente.
 *       400:
 *         description: Estado inválido.
 *       401:
 *         description: No autenticado.
 *       404:
 *         description: Entrega no encontrada.
 */
router.patch('/:id/status', (req, res, next) => deliveryController.updateStatus(req, res, next));

/**
 * @openapi
 * /api/deliveries/{id}/annotations:
 *   post:
 *     summary: Agregar observación o incidencia a la entrega (chofer / coordinador)
 *     tags:
 *       - Entregas
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la entrega
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - detail
 *             properties:
 *               detail:
 *                 type: string
 *                 example: No responde el timbre principal
 *               status:
 *                 type: string
 *                 enum: [Creado, En Preparación, En camino, Entregado, Fallo en la entrega]
 *                 example: Fallo en la entrega
 *     responses:
 *       201:
 *         description: Observación registrada exitosamente.
 *       400:
 *         description: Detalle requerido.
 *       401:
 *         description: No autenticado.
 *       404:
 *         description: Entrega no encontrada.
 */
router.post('/:id/annotations', (req, res, next) => deliveryController.addAnnotation(req, res, next));

/**
 * @openapi
 * /api/deliveries/{id}:
 *   delete:
 *     summary: Eliminar una entrega (solo coordinador)
 *     tags:
 *       - Entregas
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la entrega a eliminar
 *     responses:
 *       200:
 *         description: Entrega eliminada con éxito.
 *       400:
 *         description: ID inválido.
 *       401:
 *         description: No autenticado.
 *       403:
 *         description: Requiere rol coordinador.
 *       404:
 *         description: Entrega no encontrada.
 */
router.delete('/:id', authorize('coordinador'), (req, res, next) => deliveryController.delete(req, res, next));

export default router;
