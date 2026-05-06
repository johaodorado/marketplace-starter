# 🐠 Artquarium Marketplace

Plataforma de comercio electrónico especializada en productos acuícolas, desarrollada para **KAMILNOVA S.A.**

## 🚀 Stack Tecnológico

| Capa | Tecnología | Versión |
|---|---|---|
| API Backend | NestJS | 11.x |
| Frontend Web | Next.js | 16.x |
| Base de Datos | PostgreSQL | 16 |
| ORM | Prisma | 6.x |
| Almacenamiento de Imágenes | Cloudinary | 2.x |
| Deploy | Railway | — |
| Contenedores locales | Docker Compose | — |

---

## 📁 Estructura del Proyecto

```
marketplace-starter/
├── apps/
│   ├── api/                    # NestJS REST API
│   │   ├── prisma/
│   │   │   ├── schema.prisma   # Modelos de la DB
│   │   │   ├── migrations/     # Migraciones SQL
│   │   │   ├── seed.ts         # Datos iniciales
│   │   │   └── paleta-products.json
│   │   ├── src/
│   │   │   ├── modules/
│   │   │   │   ├── auth/       # Autenticación JWT
│   │   │   │   ├── users/      # Gestión de usuarios
│   │   │   │   ├── sellers/    # Vendedores
│   │   │   │   ├── categories/ # Categorías
│   │   │   │   ├── products/   # Productos + variantes
│   │   │   │   ├── orders/     # Órdenes de compra
│   │   │   │   └── payments/   # Pagos manuales
│   │   │   ├── common/         # Guards, filtros, utils
│   │   │   ├── config/         # Configuración y validación env
│   │   │   └── prisma/         # Servicio Prisma global
│   │   └── Dockerfile
│   └── web/                    # Next.js Frontend
│       ├── app/                # App Router (Next.js 13+)
│       │   ├── admin/          # Panel de administración
│       │   ├── cuenta/         # Perfil y órdenes del usuario
│       │   ├── productos/      # Catálogo público
│       │   ├── carrito/        # Carrito de compras
│       │   ├── checkout/       # Proceso de compra
│       │   └── pago/           # Pago manual por transferencia
│       ├── components/         # Componentes reutilizables
│       ├── lib/                # API client, utilidades del carrito
│       └── Dockerfile
└── infra/
    ├── docker-compose.yml      # Entorno local completo
    └── nginx/                  # Configuración Nginx
```

---

## ⚙️ Requisitos

- Node.js 22+
- npm 10+
- Docker y Docker Compose (para entorno local)
- Cuenta en [Cloudinary](https://cloudinary.com) (para imágenes de productos)

---

## 🔧 Variables de Entorno

Copia `.env.example` a `.env` en la raíz y configura los siguientes valores:

```bash
NODE_ENV=development
PORT=3000
APP_NAME=marketplace-api

# JWT
JWT_SECRET=tu-secret-seguro-minimo-32-caracteres
JWT_EXPIRES_IN=7d

# Base de datos
DATABASE_URL=postgresql://marketplace:marketplace@localhost:5432/marketplace?schema=public

# Opcionales (no requeridas para correr el proyecto)
REDIS_URL=redis://localhost:6379
RABBITMQ_URL=amqp://guest:guest@localhost:5672

# Cloudinary
CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret
```

> `REDIS_URL` y `RABBITMQ_URL` son opcionales. El proyecto funciona sin ellas.

---

## 🏃 Ejecutar en Local

### Con Docker (recomendado)

```bash
# 1. Clona el repositorio
git clone https://github.com/tu-usuario/marketplace-starter.git
cd marketplace-starter

# 2. Configura las variables de entorno
cp .env.example .env
# Edita .env con tus valores

# 3. Levanta todos los servicios
cd infra
docker compose --env-file ../.env up --build -d

# 4. Primera vez: migraciones y seed
docker compose exec api npx prisma migrate deploy
docker compose exec api npm run seed
```

### Sin Docker

```bash
# Terminal 1 — API
cd apps/api
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run seed
npm run start:dev

# Terminal 2 — Web
cd apps/web
npm install
npm run dev
```

**URLs locales:**

| Servicio | URL |
|---|---|
| API REST | `http://localhost:3000/api` |
| Web | `http://localhost:3001` |
| Health check | `http://localhost:3000/api/health` |

---

## 🌐 Producción (Railway)

**URLs activas:**

| Servicio | URL |
|---|---|
| API | `https://marketplace-starter-production.up.railway.app/api` |
| Web | `https://artquarium.up.railway.app` |
| Health | `https://marketplace-starter-production.up.railway.app/api/health` |

**Servicios desplegados en Railway:**

```
├── marketplace-starter  → API NestJS  (puerto 8080)
├── Artquarium           → Web Next.js (puerto 3001)
└── Postgres             → PostgreSQL 16
```

### Variables de entorno en Railway

**Servicio API (`marketplace-starter`):**

```bash
JWT_SECRET=<valor-secreto-seguro>
DATABASE_URL=${{Postgres.DATABASE_URL}}
NODE_ENV=production
CLOUDINARY_CLOUD_NAME=<valor>
CLOUDINARY_API_KEY=<valor>
CLOUDINARY_API_SECRET=<valor>
```

**Servicio Web (`Artquarium`):**

```bash
NEXT_PUBLIC_API_URL=https://marketplace-starter-production.up.railway.app/api
NODE_ENV=production
PORT=3001
```

### Start Commands

```bash
# API — con migraciones automáticas al iniciar
npx prisma migrate deploy && node dist/main.js

# Web — build y arranque estándar
npm run build && npm start
```

---

## 👤 Usuario Administrador

Creado automáticamente por el seed al primer despliegue:

```
Email:    admin@marketplace.local
Password: Admin12345
Rol:      ADMIN
```

> ⚠️ **Cambiar la contraseña inmediatamente en producción.**

---

## 📦 Módulos Implementados

| Módulo | Endpoints principales | Estado |
|---|---|---|
| Auth | `POST /auth/register`, `POST /auth/login` | ✅ Completo |
| Users | `GET /users/me`, `GET /users` (admin) | ✅ Completo |
| Sellers | `POST /sellers`, `GET /sellers/:id` | ✅ Completo |
| Categories | `GET /categories`, `POST /categories` (admin) | ✅ Completo |
| Products | `GET /products`, `POST /admin/products` | ✅ Completo |
| Orders | `POST /orders`, `GET /orders/my` | ✅ Completo |
| Payments | `POST /payments/report`, `POST /payments/:id/approve` | ✅ Completo |
| Shipments | — | ⏳ Solo schema DB |
| Reviews | — | ⏳ Solo schema DB |
| Invoices | — | ⏳ Solo schema DB |
| Chat | — | ⏳ Solo schema DB |

---

## 🗄️ Base de Datos

El proyecto usa **Prisma** como ORM con PostgreSQL 16.

### Modelo de datos principal

```
Usuario
  ├── Vendedor → Producto → VarianteProducto
  │                       → ImagenProducto
  │                       → MovimientoInventario
  ├── Orden → ItemOrden
  │        → Pago → ReservaStock
  │        → Envio
  └── Reseña
```

### Comandos Prisma

```bash
# Crear nueva migración (desarrollo)
npx prisma migrate dev --name nombre_migracion

# Aplicar migraciones en producción
npx prisma migrate deploy

# Verificar estado de migraciones
npx prisma migrate status

# Abrir Prisma Studio (explorador visual de DB)
npx prisma studio
```

### Seed

El seed precarga automáticamente:

- 1 usuario administrador
- 1 vendedor **Artquarium** (aprobado)
- 1 categoría raíz
- **18 productos** con variantes, precios y stock inicial

```bash
npm run seed
```

---

## 🖼️ Imágenes con Cloudinary

Las imágenes de productos se suben directamente desde el panel de administración.

```
Admin sube archivo → Multer (memoria) → Cloudinary API → secure_url guardada en DB
```

Se almacena únicamente la URL segura (`https://res.cloudinary.com/...`) en la base de datos.

---

## 🔐 Seguridad

- Contraseñas hasheadas con **bcrypt** (10 salt rounds)
- Autenticación con **JWT** (Bearer token, expira en 7 días)
- Guards de roles: `ADMIN`, `VENDEDOR`, `COMPRADOR`, `SOPORTE`
- Validación de todos los DTOs con **class-validator**
- Validación de variables de entorno con **Joi**
- `whitelist: true` y `forbidNonWhitelisted: true` en el ValidationPipe global

---

## 🛒 Flujo de Compra

```
1. El usuario navega el catálogo              → /productos
2. Agrega productos al carrito                → (localStorage)
3. Inicia el checkout                         → POST /api/orders
4. Se muestra la página de pago               → /pago/:orderId
5. El usuario realiza la transferencia bancaria
6. Reporta el pago con número de referencia   → POST /api/payments/report
7. El administrador revisa el comprobante     → Panel admin
8. Admin aprueba o rechaza el pago            → POST /api/payments/:id/approve
9. Al aprobar: stock descontado, reservas liberadas automáticamente
```

---


---

## 📝 Próximos Pasos 

- [ ] Módulo de envíos con seguimiento de estado
- [ ] Sistema de reseñas y calificaciones de productos
- [ ] Generación automática de facturas en PDF
- [ ] Chat en tiempo real entre comprador y vendedor
- [ ] Integración con Stripe para pagos online
- [ ] Notificaciones por email (confirmación de orden, aprobación de pago)
- [ ] Caché de productos con Redis
- [ ] Procesamiento asíncrono de eventos con RabbitMQ
- [ ] Panel de analíticas para vendedores

---

## 📄 Licencia

Proyecto privado — **KAMILNOVA S.A.** © 2026. Todos los derechos reservados.