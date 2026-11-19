import { Router } from 'express';
import { roadMapController } from '../controllers/roadMap.controller';
import { authenticate, authorize } from '../middlewares/auth';

const router = Router();

// Todas las rutas de hojas de ruta requieren autenticación
router.use(authenticate);

/**
 * @openapi
 * /api/roadmaps/today:
 *   get:
 *     summary: Obtener la hoja de ruta del día actual para el chofer logueado
 *     tags:
 *       - Hojas de Ruta
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Hoja de ruta del día con entregas y detalles de clientes.
 *       401:
 *         description: No autenticado.
 *       404:
 *         description: No se encontró hoja de ruta asignada para hoy o no es chofer.
 */
router.get('/today', (req, res, next) => roadMapController.getToday(req, res, next));

/**
 * @openapi
 * /api/roadmaps:
 *   get:
 *     summary: Listar hojas de ruta con paginación y filtros
 *     tags:
 *       - Hojas de Ruta
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
 *         description: Cantidad de hojas de ruta por página
 *       - in: query
 *         name: vehicle
 *         schema:
 *           type: string
 *         description: ID de MongoDB del vehículo
 *       - in: query
 *         name: driver
 *         schema:
 *           type: string
 *         description: ID de MongoDB del chofer
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha inicial (YYYY-MM-DD)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha final (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Listado paginado de hojas de ruta.
 *       401:
 *         description: No autenticado.
 */
router.get('/', (req, res, next) => roadMapController.getAll(req, res, next));

/**
 * @openapi
 * /api/roadmaps/{id}:
 *   get:
 *     summary: Obtener el detalle completo de una hoja de ruta por ID
 *     tags:
 *       - Hojas de Ruta
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de MongoDB de la hoja de ruta
 *     responses:
 *       200:
 *         description: Detalle de la hoja de ruta con vehículo, chofer y entregas populadas.
 *       400:
 *         description: ID inválido.
 *       401:
 *         description: No autenticado.
 *       404:
 *         description: Hoja de ruta no encontrada.
 */
router.get('/:id', (req, res, next) => roadMapController.getById(req, res, next));

/**
 * @openapi
 * /api/roadmaps:
 *   post:
 *     summary: Crear una nueva hoja de ruta asignando vehículo, chofer y entregas existentes (solo coordinador)
 *     tags:
 *       - Hojas de Ruta
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - date
 *               - vehicle
 *               - driver
 *             properties:
 *               date:
 *                 type: string
 *                 format: date-time
 *                 example: "2026-11-18T08:00:00.000Z"
 *               vehicle:
 *                 type: string
 *                 description: ID de MongoDB del vehículo
 *                 example: 671ff8890123456789abcdef
 *               driver:
 *                 type: string
 *                 description: ID de MongoDB del chofer
 *                 example: 671ff8890123456789abcde0
 *               deliveries:
 *                 type: array
 *                 description: Lista de IDs de MongoDB de entregas a asignar
 *                 items:
 *                   type: string
 *                 example: ["671ff8890123456789abcde1", "671ff8890123456789abcde2"]
 *     responses:
 *       201:
 *         description: Hoja de ruta creada exitosamente.
 *       400:
 *         description: Datos requeridos faltantes o IDs inválidos.
 *       401:
 *         description: No autenticado.
 *       403:
 *         description: Requiere rol coordinador.
 *       404:
 *         description: Vehículo, chofer o entrega no encontrada.
 */
router.post('/', authorize('coordinador'), (req, res, next) => roadMapController.create(req, res, next));

/**
 * @openapi
 * /api/roadmaps/{id}:
 *   put:
 *     summary: Actualizar una hoja de ruta existente (solo coordinador)
 *     tags:
 *       - Hojas de Ruta
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la hoja de ruta
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               date:
 *                 type: string
 *                 format: date-time
 *               vehicle:
 *                 type: string
 *               driver:
 *                 type: string
 *               deliveries:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Hoja de ruta actualizada exitosamente.
 *       400:
 *         description: Datos o ID inválidos.
 *       401:
 *         description: No autenticado.
 *       403:
 *         description: Requiere rol coordinador.
 *       404:
 *         description: Hoja de ruta no encontrada.
 */
router.put('/:id', authorize('coordinador'), (req, res, next) => roadMapController.update(req, res, next));

/**
 * @openapi
 * /api/roadmaps/{id}/deliveries:
 *   post:
 *     summary: Vincular una entrega a una hoja de ruta (solo coordinador)
 *     tags:
 *       - Hojas de Ruta
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la hoja de ruta
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - deliveryId
 *             properties:
 *               deliveryId:
 *                 type: string
 *                 example: 671ff8890123456789abcde1
 *     responses:
 *       200:
 *         description: Entrega vinculada exitosamente.
 *       400:
 *         description: ID inválido.
 *       401:
 *         description: No autenticado.
 *       403:
 *         description: Requiere rol coordinador.
 *       404:
 *         description: Hoja de ruta o entrega no encontrada.
 */
router.post('/:id/deliveries', authorize('coordinador'), (req, res, next) => roadMapController.addDelivery(req, res, next));

/**
 * @openapi
 * /api/roadmaps/{id}/deliveries/{deliveryId}:
 *   delete:
 *     summary: Desvincular una entrega de una hoja de ruta (solo coordinador)
 *     tags:
 *       - Hojas de Ruta
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la hoja de ruta
 *       - in: path
 *         name: deliveryId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la entrega a desvincular
 *     responses:
 *       200:
 *         description: Entrega desvinculada exitosamente.
 *       400:
 *         description: ID inválido.
 *       401:
 *         description: No autenticado.
 *       403:
 *         description: Requiere rol coordinador.
 *       404:
 *         description: Hoja de ruta no encontrada.
 */
router.delete('/:id/deliveries/:deliveryId', authorize('coordinador'), (req, res, next) =>
  roadMapController.removeDelivery(req, res, next)
);

/**
 * @openapi
 * /api/roadmaps/{id}:
 *   delete:
 *     summary: Eliminar una hoja de ruta (solo coordinador)
 *     tags:
 *       - Hojas de Ruta
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la hoja de ruta
 *     responses:
 *       200:
 *         description: Hoja de ruta eliminada con éxito.
 *       400:
 *         description: ID inválido.
 *       401:
 *         description: No autenticado.
 *       403:
 *         description: Requiere rol coordinador.
 *       404:
 *         description: Hoja de ruta no encontrada.
 */
router.delete('/:id', authorize('coordinador'), (req, res, next) => roadMapController.delete(req, res, next));

export default router;
