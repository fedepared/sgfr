import swaggerJSDoc from 'swagger-jsdoc';
import path from 'path';

// swagger-jsdoc utiliza la librería glob, la cual requiere barras normales (/) incluso en Windows
const routesTsPath = path.resolve(__dirname, 'routes', '*.ts').split(path.sep).join('/');
const routesJsPath = path.resolve(__dirname, 'routes', '*.js').split(path.sep).join('/');

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'SGFR - Sistema de Gestión de Flota y Reparto',
      version: '1.0.0',
      description: 'Documentación interactiva de la API REST del SGFR (Programación III)',
    },
    servers: [
      {
        url: 'http://localhost:4000',
        description: 'Servidor local de desarrollo',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Ingresa tu token JWT obtenido en /api/auth/login. Formato: <token>',
        },
      },
    },
  },
  apis: [
    routesTsPath,
    routesJsPath,
    './src/routes/*.ts',
    './dist/routes/*.js',
  ],
};

export const swaggerSpec = swaggerJSDoc(options);
