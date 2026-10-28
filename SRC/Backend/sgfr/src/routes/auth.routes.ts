import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { authenticate } from '../middlewares/auth';

const router = Router();

/**
 * @openapi
 * /api/auth/register:
 *   post:
 *     summary: Registrar un nuevo usuario
 *     tags:
 *       - Autenticación
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userName
 *               - password
 *             properties:
 *               userName:
 *                 type: string
 *                 example: nuevo_usuario
 *               password:
 *                 type: string
 *                 example: clave_secreta_123
 *               roleName:
 *                 type: string
 *                 example: chofer
 *                 description: Rol del usuario (coordinador o chofer). Por defecto es chofer.
 *     responses:
 *       201:
 *         description: Usuario registrado exitosamente.
 *       400:
 *         description: Datos requeridos faltantes o rol inexistente.
 *       409:
 *         description: El nombre de usuario ya existe.
 */
router.post('/register', (req, res, next) => authController.register(req, res, next));

/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     summary: Iniciar sesión y obtener token JWT
 *     tags:
 *       - Autenticación
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userName
 *               - password
 *             properties:
 *               userName:
 *                 type: string
 *                 example: coordinador_prueba
 *               password:
 *                 type: string
 *                 example: coordinador_prueba_123
 *     responses:
 *       200:
 *         description: Inicio de sesión exitoso. Retorna datos del usuario y token JWT.
 *       400:
 *         description: Falta usuario o contraseña.
 *       401:
 *         description: Credenciales inválidas.
 */
router.post('/login', (req, res, next) => authController.login(req, res, next));

/**
 * @openapi
 * /api/auth/profile:
 *   get:
 *     summary: Obtener el perfil del usuario autenticado
 *     tags:
 *       - Autenticación
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Perfil del usuario obtenido con éxito.
 *       401:
 *         description: Token no provisto o inválido.
 *       404:
 *         description: Usuario no encontrado.
 */
router.get('/profile', authenticate, (req, res, next) => authController.getProfile(req, res, next));

export default router;
