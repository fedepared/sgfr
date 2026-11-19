import app from './app';
import { config } from './config';

if (!process.env.VERCEL) {
  app.listen(config.port, () => {
    console.log(`Servidor escuchando en http://localhost:${config.port}`);
    console.log(`Documentación Swagger en http://localhost:${config.port}/api-docs`);
  });
}

export default app;