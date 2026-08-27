# Cheatsheet: Conceptos y herramientas del curso de testing

Resumen de todo lo montado en `testing-course` y los conceptos detrás de cada pieza.

---

## 1. Arquitectura general: cómo se relacionan las piezas

```
┌────────────────────────────────────────────────────────────┐
│  TÚ ESCRIBES TESTS (Jest)                                   │
│  → BooksService  → espera un "DB falso" (DI / mocks)        │
│  → routes/app    → esperan un service falso (createApp)     │
├────────────────────────────────────────────────────────────┤
│  api/ (Node + Express 5)                                    │
│  routes → services → lib/MongoLib → driver de MongoDB       │
└────────────────────────────────────────────────────────────┘
        │                                    │
   corre con pnpm                      se conecta a
        │                                    │
   en tu WSL (Ubuntu)                  MongoDB 8.0 (Docker)
        │                                    │
  Windows                      ┌────────────┴──────────────┐
                               │ docker compose (infra)    │
                               │ MongoDB Compass (GUI)     │
                               └───────────────────────────┘
```

**Idea clave:** Docker corre la *base de datos*, Node corre la *app*, Compass es solo una *ventana a la base de datos* y Jest es la *herramienta que verifica la app*. Cada pieza tiene un solo trabajo.

---

## 2. Arquitectura de `api/` (el patrón por capas)

La API está separada en **capas**, y cada capa existe para poder testearla **por separado**:

| Capa | Archivo | Responsabilidad |
|---|---|---|
| **Entrada** | `src/index.js` | Raíz de composición — arma todo, inicia el servidor |
| **HTTP** | `src/app.js` | `createApp(service)` crea una instancia de Express *sin iniciarla* → esto es lo que importa Jest para probar rutas |
| **Rutas** | `routes/books.router.js` | Recibe un `booksService`, maneja req/res, try/catch → `next(error)` |
| **Servicio** | `services/books.service.js` | Lógica de negocio — recibe el cliente de BD inyectado, solo llama `getAll()` / `create()` |
| **Datos** | `lib/mongo.lib.js` | CRUD de bajo nivel contra MongoDB (conexión perezosa) |

**Por qué está diseñado así:**

- `createApp()` no llama `listen()` → los tests levantan la app en memoria (con `supertest`) **sin puerto**.
- **Inyección de dependencias (DI):** `new BooksService(mockDB)` — en producción le pasas el `MongoLib` real; en los tests le pasas un *mock/falso*.

```
Producción:  index.js → MongoLib real → BooksService real → createApp()
Tests:       tuTest   → DB falsa/mock → BooksService real → createApp(falsa)
```

---

## 3. Docker y Docker Compose (la infraestructura)

**Problema que resuelve Docker:** "Una base de datos corriendo igual en todos lados." Sin instalación manual, sin problemas de versiones.

- **Docker** = ejecuta "contenedores" aislados (un programa + su entorno empaquetado).
- **Imagen** = la receta/plantilla (`mongo:8.0` es el servidor de Mongo oficial, ya configurado).
- **Contenedor** = una instancia corriendo de una imagen.
- **Docker Compose** = un archivo YAML que *declara* qué contenedores correr y cómo. `docker compose up -d` = "lee la receta e inícialo en segundo plano".

Tu `docker-compose.yml` solo hace 3 cosas:

```yaml
image: mongo:8.0                                              # obtener el servidor
MONGO_INITDB_ROOT_USERNAME / _PASSWORD                        # crear usuario root (solo primer arranque)
ports: [27017:27017]                                          # hacerlo alcanzable en localhost
```

**Lo que Compose NO hace:** no crea tu BD `demo` ni la colección `books`. Mongo las crea **perezosamente al primer insert**. El contenedor *alberga* los datos; la app *crea el esquema* implícitamente.

**Regla de persistencia (el "gotcha"):**

- `docker compose down` → los datos **sobreviven**.
- `docker compose down -v` → el volumen se elimina, **se pierden los datos**.
- Un *volumen con nombre* (`mongo-data:/data/db`) hace que los datos sobrevivan incluso si se recrea el contenedor — actualmente tu compose usa un volumen anónimo.

---

## 4. Tu camino por WSL2 + Docker Desktop (por qué hubo que arreglarlo)

Entorno: Docker Desktop en **Windows**, Mongo corriendo **dentro de WSL2 (Ubuntu)**, app Node también en Ubuntu.

Los tres errores y qué significaban:

1. **"command 'docker' could not be found in this WSL 2 distro"** → el motor de Docker no estaba conectado a Ubuntu (se arregló en *Settings → WSL Integration → Ubuntu*).
2. **"permission denied ... /var/run/docker.sock"** → el CLI encontró el socket, pero tu sesión no tenía activo el grupo `docker`. Ya estabas en el grupo; refrescar la sesión (`newgrp docker` / reabrir terminal) lo arregló.

**En resumen:** `docker` (binario Linux en Ubuntu) → habla con `docker-desktop` (el motor) → corre contenedores; el puerto 27017 es alcanzable desde Windows y WSL en `localhost`.

---

## 5. MongoDB — los conceptos de datos

- **Base de datos** = `demo` → **Colección** = `books` → **Documento** = un registro tipo JSON.
- Un `GET` sobre una colección inexistente devuelve `[]` y **no crea nada**; solo el **primer insert** crea BD + colección.
- Las credenciales `root`/`root123` vienen de tu compose file y se le pasan a Mongo vía tu `.env` (`MONGO_URL=mongodb://root:root123@localhost:27017...`).

---

## 6. MongoDB Compass

Un **cliente GUI** (una ventana a la BD), que se instala en **Windows** como cualquier app. Se conecta con la misma URL que usa la app:

```
mongodb://root:root123@localhost:27017/demo
```

**Utilidad:** insertar/editar/borrar documentos, ejecutar consultas e inspeccionar lo que almacenó la app — sin escribir código. Para MongoDB es lo que MySQL Workbench es para MySQL. No es obligatorio, pero coincide con el flujo del curso; la alternativa CLI es `mongosh` dentro del contenedor.

---

## 7. Jest — dónde aplicarás todo esto

La base está lista para que **tú** escribas los tests:

- Stack listo: `jest` 30 configurado, `pnpm test` en `api/`, ESLint ya acepta los globals de `*.test.js`.
- Tres objetivos naturales de testeo que controlas vía DI:
  1. `BooksService` → inyectar un `MongoLib` falso/mock.
  2. `routes` + `app.js` → inyectar un service falso + `supertest` contra `createApp(falso)`.
  3. `MongoLib` → mockear el driver (test sin BD real), o usar `mongodb-memory-server`.

---

## 8. Referencia rápida

| Herramienta | Rol | Comando / dato clave |
|---|---|---|
| **pnpm** | gestor de paquetes | `pnpm install`, `pnpm test`, `pnpm lint`, `pnpm start:dev` |
| **Docker Desktop** | corre contenedores en Windows | motor conectado a Ubuntu vía integración WSL |
| **Docker Compose** | declara la infra | `docker compose up -d` (en `api/`) |
| **MongoDB 8.0** | base de datos | se auto-crea en el primer insert; URL en `.env` |
| **MongoDB Compass** | GUI de la BD | se conecta en `localhost:27017` con root/root123 |
| **Express 5** | servidor HTTP | `createApp()` es la factory testeable |
| **DI (inyección por constructor)** | testeabilidad | en tests pasas falsos, en producción objetos reales |
| **Jest 30** | corredor de tests | `pnpm test`; ataca primero Service, luego Routes, luego Lib |

---

## 9. Comandos útiles de un vistazo

```bash
# API
cd api
pnpm install          # instalar dependencias
pnpm start:dev        # correr la app con hot-reload (nodemon)
pnpm test             # correr los tests de Jest
pnpm test -- --watch  # tests en modo watch
pnpm lint             # linter
pnpm lint:fix         # autofix del linter

# Base de datos (Docker)
docker compose up -d      # levantar Mongo en segundo plano
docker compose down       # detener Mongo (los datos sobreviven)
docker compose down -v    # detener y BORRAR los datos del volumen

# Verificar que Mongo responde (desde WSL)
curl http://localhost:3000/api/v1/books   # GET → 200 []
curl -X POST http://localhost:3000/api/v1/books \
  -H "content-type: application/json" \
  -d '{"title":"Mi libro"}'
```