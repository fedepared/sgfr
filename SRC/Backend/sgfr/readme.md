# SGFR Backend

API REST para un Sistema de Gestion de Flota y Reparto (SGFR), desarrollado con Node.js, Express y TypeScript.

## Instalacion

Desde la carpeta raiz del backend, donde se encuentra `package.json`:

```bash
npm install
```

## Ejecucion

### Desarrollo

```bash
npm run dev
```

Este comando ejecuta `src/index.ts` con `tsx`. El servidor estara disponible en `http://localhost:4000`.

No se debe ejecutar `node src/index.ts` ni `node src/app.ts`, porque Node.js no interpreta TypeScript directamente.

### Produccion

```bash
npm run build
npm start
```

El primer comando compila TypeScript y genera `dist/`; el segundo ejecuta `dist/index.js`.

## Comandos disponibles

| Comando | Descripcion |
| --- | --- |
| `npm install` | Instala las dependencias. |
| `npm run dev` | Inicia el servidor en desarrollo con `tsx`. |
| `npm run build` | Compila TypeScript en `dist/`. |
| `npm start` | Ejecuta la version compilada. |
| `npm test` | Comando reservado para pruebas automatizadas. |

## Estructura del proyecto

```text
sgfr/
├── package.json
├── tsconfig.json
├── readme.md
├── src/
│   ├── index.ts
│   ├── app.ts
│   ├── controllers/
│   ├── data/
│   ├── middlewares/
│   ├── routes/
│   └── services/
└── dist/                 # Se genera con npm run build
```

### `src/index.ts`

Es el punto de entrada. Inicia Express y hace que el servidor escuche en el puerto `4000`.

### `src/app.ts`

Contendra la configuracion principal de Express: middlewares generales, rutas y manejo centralizado de errores. Separar esta configuracion del inicio facilita las pruebas.

### `src/controllers/`

Contendra los controladores de la API. Recibiran solicitudes HTTP, validaran datos, invocaran servicios y devolveran respuestas. Se agregaran controladores para vehiculos, conductores, repartos, entregas, usuarios y autenticacion.

### `src/services/`

Contendra la logica de negocio: asignacion de vehiculos y conductores, planificacion de repartos, actualizacion de entregas y reglas de la flota.

### `src/routes/`

Contendra los endpoints y su relacion con los controladores. Las rutas se organizaran por recurso, por ejemplo `/api/vehiculos`, `/api/conductores`, `/api/repartos` y `/api/entregas`.

### `src/middlewares/`

Contendra autenticacion JWT, autorizacion por roles, validacion de datos, registro de solicitudes y manejo de errores.

### `src/data/`

Contendra la configuracion de la base de datos, modelos, repositorios, consultas y datos iniciales. Esta capa separa el acceso a datos de la logica de negocio.

## Flujo de una solicitud

```text
Cliente HTTP -> routes -> middlewares -> controllers -> services -> data -> respuesta HTTP
```

## Tecnologias

- Node.js y Express para el servidor y la API REST.
- TypeScript para el tipado estatico.
- `tsx` para ejecutar TypeScript durante el desarrollo.
- `jsonwebtoken` para autenticacion JWT.
- `bcrypt` para proteger contrasenas.
- `cors` para solicitudes desde otros origenes.
- `dotenv` para variables de entorno.

## Variables de entorno

Las configuraciones sensibles deben guardarse en `.env`, que no debe subirse al repositorio:

```env
PORT=4000
DATABASE_URL=...
JWT_SECRET=...
```

## Probar la API

Con el servidor iniciado:

```bash
curl http://localhost:4000/
```

La respuesta actual es `Hola, Programacion III`.
