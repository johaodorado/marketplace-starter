# Marketplace Starter

Arranque inicial del proyecto marketplace según el documento base.

## Alcance incluido

Este starter deja lista la base del **Sprint 1**:

- Auth con JWT
- Users
- Sellers
- RBAC
- Prisma con PostgreSQL
- Docker Compose con PostgreSQL, Redis, RabbitMQ y Nginx
- Prisma schema robusto para continuar con los siguientes sprints

## Estructura

```txt
marketplace-starter/
  apps/api
  infra
```

## Requisitos

- Node.js 22+
- npm 10+
- Docker y Docker Compose

## Variables de entorno

Copia `.env.example` a `.env`.

## Ejecutar local

```bash
cd apps/api
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run seed
npm run start:dev
```

API:
- `http://localhost:3000`
- Health: `GET /api/health`

## Ejecutar con Docker

```bash
cd infra
docker compose --env-file ../.env up --build
```

## Usuario administrador de seed

- email: `admin@marketplace.local`
- password: `Admin12345`

Cámbialo apenas arranque el proyecto.

## Próximo paso recomendado

Seguir con Sprint 2:
- Categories
- Products
- Images
- Variants
- Stock
