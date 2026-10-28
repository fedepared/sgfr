import { Router } from 'express';
import { vehicleController } from '../controllers/vehicle.controller';
import { authenticate, authorize } from '../middlewares/auth';

const router = Router();

// Todas las operaciones con vehículos requieren estar autenticado
router.use(authenticate);

/**
 * @openapi
 * /api/vehicles:
 *   get:
 *     summary: Listar vehículos con paginación y filtros
 *     tags:
 *       - Vehículos
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
 *         description: Cantidad de vehículos por página
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Búsqueda parcial por patente (ej. AF123)
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filtrar por ID o nombre de estado (ej. Disponible, En ruta, En mantenimiento)
 *       - in: query
 *         name: vehicleType
 *         schema:
 *           type: string
 *         description: Filtrar por ID o nombre de tipo (ej. Camión, Camioneta, Furgón)
 *     responses:
 *       200:
 *         description: Listado paginado de vehículos.
 *       401:
 *         description: No autenticado.
 */
router.get('/', (req, res, next) => vehicleController.getAll(req, res, next));

/**
 * @openapi
 * /api/vehicles/{id}:
 *   get:
 *     summary: Obtener el detalle de un vehículo por ID
 *     tags:
 *       - Vehículos
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de MongoDB del vehículo
 *     responses:
 *       200:
 *         description: Datos detallados del vehículo.
 *       400:
 *         description: ID de formato inválido.
 *       401:
 *         description: No autenticado.
 *       404:
 *         description: Vehículo no encontrado.
 */
router.get('/:id', (req, res, next) => vehicleController.getById(req, res, next));

/**
 * @openapi
 * /api/vehicles:
 *   post:
 *     summary: Dar de alta un nuevo vehículo (solo coordinador)
 *     tags:
 *       - Vehículos
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - licensePlate
 *               - vehicleType
 *               - capacity
 *               - status
 *             properties:
 *               licensePlate:
 *                 type: string
 *                 example: AF999ZZ
 *               vehicleType:
 *                 type: string
 *                 description: ID de MongoDB de VehicleType
 *                 example: 671ff8890123456789abcdef
 *               capacity:
 *                 type: number
 *                 example: 3500
 *               status:
 *                 type: string
 *                 description: ID de MongoDB de VehicleStatusType
 *                 example: 671ff8890123456789abcde0
 *     responses:
 *       201:
 *         description: Vehículo creado exitosamente.
 *       400:
 *         description: Datos requeridos faltantes o tipos inválidos.
 *       401:
 *         description: No autenticado.
 *       403:
 *         description: Requiere rol coordinador.
 *       409:
 *         description: La patente ya está registrada.
 */
router.post('/', authorize('coordinador'), (req, res, next) => vehicleController.create(req, res, next));

/**
 * @openapi
 * /api/vehicles/{id}:
 *   put:
 *     summary: Modificar datos de un vehículo (solo coordinador)
 *     tags:
 *       - Vehículos
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del vehículo a modificar
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               licensePlate:
 *                 type: string
 *                 example: AF999YY
 *               vehicleType:
 *                 type: string
 *                 example: 671ff8890123456789abcdef
 *               capacity:
 *                 type: number
 *                 example: 4000
 *               status:
 *                 type: string
 *                 example: 671ff8890123456789abcde0
 *     responses:
 *       200:
 *         description: Vehículo actualizado exitosamente.
 *       400:
 *         description: Datos o ID inválidos.
 *       401:
 *         description: No autenticado.
 *       403:
 *         description: Requiere rol coordinador.
 *       404:
 *         description: Vehículo no encontrado.
 *       409:
 *         description: La nueva patente ya pertenece a otro vehículo.
 */
router.put('/:id', authorize('coordinador'), (req, res, next) => vehicleController.update(req, res, next));

/**
 * @openapi
 * /api/vehicles/{id}/status:
 *   patch:
 *     summary: Actualizar el estado de un vehículo (solo coordinador)
 *     tags:
 *       - Vehículos
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del vehículo
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
 *                 description: ID de MongoDB del nuevo VehicleStatusType
 *                 example: 671ff8890123456789abcde0
 *     responses:
 *       200:
 *         description: Estado del vehículo actualizado.
 *       400:
 *         description: Estado o ID inválidos.
 *       401:
 *         description: No autenticado.
 *       403:
 *         description: Requiere rol coordinador.
 *       404:
 *         description: Vehículo o estado no encontrado.
 */
router.patch('/:id/status', authorize('coordinador'), (req, res, next) => vehicleController.updateStatus(req, res, next));

/**
 * @openapi
 * /api/vehicles/{id}:
 *   delete:
 *     summary: Eliminar un vehículo de la flota (solo coordinador)
 *     tags:
 *       - Vehículos
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del vehículo a eliminar
 *     responses:
 *       200:
 *         description: Vehículo eliminado con éxito.
 *       400:
 *         description: ID inválido.
 *       401:
 *         description: No autenticado.
 *       403:
 *         description: Requiere rol coordinador.
 *       404:
 *         description: Vehículo no encontrado.
 */
router.delete('/:id', authorize('coordinador'), (req, res, next) => vehicleController.delete(req, res, next));

export default router;
