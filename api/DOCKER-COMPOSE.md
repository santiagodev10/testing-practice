# Docker vs Docker Compose

## La idea en dos palabras

- **Docker** = el motor. Construye y ejecuta *un solo contenedor* a la vez, manejándolo con **comandos**.
- **Docker Compose** = un orquestador encima de Docker. Maneja *varios servicios* a la vez usando un **archivo de configuración** (`docker-compose.yml`).

## Los dos archivos y sus etapas

Pensemos en **dos etapas distintas** de la vida de tu aplicación:

| | **Dockerfile** | **docker-compose.yml** |
|---|---|---|
| **Etapa** | Construcción de la *imagen* (el molde) | Ejecución de los *contenedores* (correrlos) |
| **¿Qué define?** | Qué contiene el contenedor (código, dependencias, comando) | Cómo correr los servicios (puertos, env, red, orden) |
| **¿Contiene lógica del proyecto?** | Sí | No, solo configuración de ejecución |
| **Comando que lo usa** | `docker build` | `docker compose up` |

### Dockerfile — CÓMO se construye la imagen (el molde)

Es el **plano de la imagen**. Contiene tu proyecto: código, dependencias, comando de arranque.

```dockerfile
FROM node:20-alpine          # imagen base
WORKDIR /usr/src/app         # carpeta de trabajo
COPY package.json ./         # copia tus archivos al contenedor
RUN pnpm install             # instala dependencias DENTRO de la imagen
EXPOSE 3000                  # informativo: qué puerto usará
CMD ["node", "src/index.js"] # comando al arrancar
```

Lo construyes una vez: `docker build -t mi-api .`

### docker-compose.yml — CÓMO se ejecutan los servicios

No construye lógica. Solo describe la **configuración de ejecución**: qué imagen, puertos, variables de entorno y dependencias entre servicios.

```yaml
services:
  mongo:                     # servicio 1
    image: mongo:8.0         # imagen pública (sin Dockerfile propio)
    ports: [27017:27017]
  api:                       # servicio 2
    build: .                 # "construye usando el Dockerfile de esta carpeta"
    depends_on: [mongo]      # espera a que mongo esté listo
```

## Cómo se conectan

```
docker build        →   usa Dockerfile(s)        →   crea las imágenes
docker compose up   →   usa docker-compose.yml   →   crea y corre los contenedores juntos
```

## Dato importante: `localhost` vs el nombre del servicio

Dentro de la red de Compose, los servicios se llaman entre sí por su **nombre** (`mongo`, `api`...), no por `localhost`. Por eso en el compose la URL va a `mongo` en lugar de `localhost`:

```yaml
MONGO_URL: mongodb://root:root123@mongo:27017...
#                                  ^^^^^
#                            nombre del servicio, no localhost
```

Dentro del contenedor, `localhost` apunta al propio contenedor (la API), no a Mongo. Fuera de Docker (en tu máquina con `pnpm start`), `localhost` sí funciona — por eso tu `.env.example` lo usa.

## Resumen de diferencias

1. **Cantidad de servicios**: Docker maneja un contenedor; Compose maneja muchos a la vez (red, orden, volúmenes).
2. **Configuración**: Docker configura por **comandos**; Compose configura por **archivo** (`docker-compose.yml`).
3. **Etapas**: `Dockerfile` define el **build**; `docker-compose.yml` define el **run**. Se complementan.
