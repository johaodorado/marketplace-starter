-- CreateEnum
CREATE TYPE "RolUsuario" AS ENUM ('COMPRADOR', 'VENDEDOR', 'ADMIN', 'SOPORTE');

-- CreateEnum
CREATE TYPE "EstadoVendedor" AS ENUM ('PENDIENTE', 'APROBADO', 'RECHAZADO', 'SUSPENDIDO');

-- CreateEnum
CREATE TYPE "EstadoProducto" AS ENUM ('BORRADOR', 'ACTIVO', 'PAUSADO', 'ARCHIVADO');

-- CreateEnum
CREATE TYPE "EstadoOrden" AS ENUM ('CREADA', 'PAGADA', 'ENVIADA', 'ENTREGADA', 'CANCELADA', 'REEMBOLSADA');

-- CreateEnum
CREATE TYPE "EstadoPago" AS ENUM ('PENDIENTE', 'APROBADO', 'RECHAZADO', 'REEMBOLSADO');

-- CreateEnum
CREATE TYPE "EstadoEnvio" AS ENUM ('PENDIENTE', 'ENVIADO', 'ENTREGADO');

-- CreateEnum
CREATE TYPE "TipoMovimientoInventario" AS ENUM ('INGRESO', 'EGRESO', 'AJUSTE', 'RESERVA', 'LIBERACION');

-- CreateEnum
CREATE TYPE "EstadoTicketSoporte" AS ENUM ('ABIERTO', 'EN_PROCESO', 'RESUELTO', 'CERRADO');

-- CreateTable
CREATE TABLE "Usuario" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "telefono" TEXT,
    "passwordHash" TEXT NOT NULL,
    "rol" "RolUsuario" NOT NULL DEFAULT 'COMPRADOR',
    "nombre" TEXT,
    "apellido" TEXT,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,
    "externalSystem" TEXT,
    "externalId" TEXT,
    "externalSyncedAt" TIMESTAMP(3),
    "externalMeta" JSONB,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Direccion" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "nombreCompleto" TEXT NOT NULL,
    "telefono" TEXT NOT NULL,
    "pais" TEXT NOT NULL,
    "provincia" TEXT NOT NULL,
    "ciudad" TEXT NOT NULL,
    "linea1" TEXT NOT NULL,
    "linea2" TEXT,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Direccion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Vendedor" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "nombreTienda" TEXT NOT NULL,
    "estado" "EstadoVendedor" NOT NULL DEFAULT 'PENDIENTE',
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,
    "externalSystem" TEXT,
    "externalId" TEXT,
    "externalSyncedAt" TIMESTAMP(3),
    "externalMeta" JSONB,

    CONSTRAINT "Vendedor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Categoria" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "slug" TEXT NOT NULL,

    CONSTRAINT "Categoria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Producto" (
    "id" TEXT NOT NULL,
    "vendedorId" TEXT NOT NULL,
    "categoriaId" TEXT,
    "titulo" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "estado" "EstadoProducto" NOT NULL DEFAULT 'ACTIVO',
    "precioBase" DECIMAL(12,2) NOT NULL,
    "moneda" TEXT NOT NULL DEFAULT 'USD',
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,
    "externalSystem" TEXT,
    "externalId" TEXT,
    "externalSyncedAt" TIMESTAMP(3),
    "externalMeta" JSONB,

    CONSTRAINT "Producto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ImagenProducto" (
    "id" TEXT NOT NULL,
    "productoId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "orden" INTEGER NOT NULL DEFAULT 0,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ImagenProducto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VarianteProducto" (
    "id" TEXT NOT NULL,
    "productoId" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "sku" TEXT,
    "precio" DECIMAL(12,2),
    "stock" INTEGER NOT NULL DEFAULT 0,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VarianteProducto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Orden" (
    "id" TEXT NOT NULL,
    "compradorId" TEXT NOT NULL,
    "vendedorId" TEXT NOT NULL,
    "estado" "EstadoOrden" NOT NULL DEFAULT 'CREADA',
    "subtotal" DECIMAL(12,2) NOT NULL,
    "comision" DECIMAL(12,2) NOT NULL,
    "total" DECIMAL(12,2) NOT NULL,
    "moneda" TEXT NOT NULL DEFAULT 'USD',
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,
    "externalSystem" TEXT,
    "externalId" TEXT,
    "externalSyncedAt" TIMESTAMP(3),
    "externalMeta" JSONB,

    CONSTRAINT "Orden_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ItemOrden" (
    "id" TEXT NOT NULL,
    "ordenId" TEXT NOT NULL,
    "productoId" TEXT NOT NULL,
    "varianteId" TEXT,
    "cantidad" INTEGER NOT NULL,
    "tituloSnapshot" TEXT NOT NULL,
    "skuSnapshot" TEXT,
    "precioUnitarioSnapshot" DECIMAL(12,2) NOT NULL,
    "monedaSnapshot" TEXT NOT NULL DEFAULT 'USD',

    CONSTRAINT "ItemOrden_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pago" (
    "id" TEXT NOT NULL,
    "ordenId" TEXT NOT NULL,
    "estado" "EstadoPago" NOT NULL DEFAULT 'PENDIENTE',
    "monto" DECIMAL(12,2) NOT NULL,
    "moneda" TEXT NOT NULL DEFAULT 'USD',
    "stripePaymentIntentId" TEXT,
    "stripeCustomerId" TEXT,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,
    "externalSystem" TEXT,
    "externalId" TEXT,
    "externalSyncedAt" TIMESTAMP(3),
    "externalMeta" JSONB,

    CONSTRAINT "Pago_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymentAttempt" (
    "id" TEXT NOT NULL,
    "pagoId" TEXT NOT NULL,
    "provider" TEXT NOT NULL DEFAULT 'STRIPE',
    "providerIntentId" TEXT,
    "estado" TEXT NOT NULL,
    "raw" JSONB,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PaymentAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Refund" (
    "id" TEXT NOT NULL,
    "pagoId" TEXT NOT NULL,
    "monto" DECIMAL(12,2) NOT NULL,
    "moneda" TEXT NOT NULL DEFAULT 'USD',
    "stripeRefundId" TEXT,
    "estado" TEXT NOT NULL,
    "raw" JSONB,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Refund_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StripeEvent" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "recibidoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StripeEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Envio" (
    "id" TEXT NOT NULL,
    "ordenId" TEXT NOT NULL,
    "transportista" TEXT,
    "codigoTracking" TEXT,
    "estado" "EstadoEnvio" NOT NULL DEFAULT 'PENDIENTE',
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,
    "externalSystem" TEXT,
    "externalId" TEXT,
    "externalSyncedAt" TIMESTAMP(3),
    "externalMeta" JSONB,

    CONSTRAINT "Envio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EnvioEvento" (
    "id" TEXT NOT NULL,
    "envioId" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "descripcion" TEXT,
    "ocurridoEn" TIMESTAMP(3) NOT NULL,
    "raw" JSONB,

    CONSTRAINT "EnvioEvento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InventarioMovimiento" (
    "id" TEXT NOT NULL,
    "varianteId" TEXT NOT NULL,
    "tipo" "TipoMovimientoInventario" NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "motivo" TEXT,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InventarioMovimiento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReservaStock" (
    "id" TEXT NOT NULL,
    "varianteId" TEXT NOT NULL,
    "ordenId" TEXT NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "liberadoEn" TIMESTAMP(3),

    CONSTRAINT "ReservaStock_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChatConversacion" (
    "id" TEXT NOT NULL,
    "ordenId" TEXT NOT NULL,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChatConversacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChatMensaje" (
    "id" TEXT NOT NULL,
    "conversacionId" TEXT NOT NULL,
    "autorUsuarioId" TEXT NOT NULL,
    "contenido" TEXT NOT NULL,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChatMensaje_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Resena" (
    "id" TEXT NOT NULL,
    "productoId" TEXT NOT NULL,
    "compradorId" TEXT NOT NULL,
    "ordenId" TEXT NOT NULL,
    "calificacion" INTEGER NOT NULL,
    "comentario" TEXT,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Resena_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Factura" (
    "id" TEXT NOT NULL,
    "ordenId" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "fechaEmision" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "subtotal" DECIMAL(12,2) NOT NULL,
    "impuestos" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "total" DECIMAL(12,2) NOT NULL,
    "moneda" TEXT NOT NULL DEFAULT 'USD',
    "externalSystem" TEXT,
    "externalId" TEXT,
    "externalSyncedAt" TIMESTAMP(3),
    "externalMeta" JSONB,

    CONSTRAINT "Factura_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FacturaItem" (
    "id" TEXT NOT NULL,
    "facturaId" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "precioUnitario" DECIMAL(12,2) NOT NULL,
    "total" DECIMAL(12,2) NOT NULL,

    CONSTRAINT "FacturaItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "actorUsuarioId" TEXT,
    "accion" TEXT NOT NULL,
    "entidad" TEXT NOT NULL,
    "entidadId" TEXT,
    "detalle" JSONB,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TicketSoporte" (
    "id" TEXT NOT NULL,
    "creadorUsuarioId" TEXT NOT NULL,
    "estado" "EstadoTicketSoporte" NOT NULL DEFAULT 'ABIERTO',
    "asunto" TEXT NOT NULL,
    "descripcion" TEXT,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TicketSoporte_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");

-- CreateIndex
CREATE INDEX "Usuario_rol_idx" ON "Usuario"("rol");

-- CreateIndex
CREATE INDEX "Direccion_usuarioId_idx" ON "Direccion"("usuarioId");

-- CreateIndex
CREATE UNIQUE INDEX "Vendedor_usuarioId_key" ON "Vendedor"("usuarioId");

-- CreateIndex
CREATE INDEX "Vendedor_estado_idx" ON "Vendedor"("estado");

-- CreateIndex
CREATE UNIQUE INDEX "Categoria_slug_key" ON "Categoria"("slug");

-- CreateIndex
CREATE INDEX "Categoria_slug_idx" ON "Categoria"("slug");

-- CreateIndex
CREATE INDEX "Producto_vendedorId_estado_idx" ON "Producto"("vendedorId", "estado");

-- CreateIndex
CREATE INDEX "Producto_categoriaId_estado_idx" ON "Producto"("categoriaId", "estado");

-- CreateIndex
CREATE INDEX "ImagenProducto_productoId_idx" ON "ImagenProducto"("productoId");

-- CreateIndex
CREATE UNIQUE INDEX "VarianteProducto_sku_key" ON "VarianteProducto"("sku");

-- CreateIndex
CREATE INDEX "VarianteProducto_productoId_idx" ON "VarianteProducto"("productoId");

-- CreateIndex
CREATE INDEX "Orden_compradorId_creadoEn_idx" ON "Orden"("compradorId", "creadoEn");

-- CreateIndex
CREATE INDEX "Orden_vendedorId_creadoEn_idx" ON "Orden"("vendedorId", "creadoEn");

-- CreateIndex
CREATE INDEX "Orden_estado_creadoEn_idx" ON "Orden"("estado", "creadoEn");

-- CreateIndex
CREATE INDEX "ItemOrden_ordenId_idx" ON "ItemOrden"("ordenId");

-- CreateIndex
CREATE INDEX "ItemOrden_productoId_idx" ON "ItemOrden"("productoId");

-- CreateIndex
CREATE UNIQUE INDEX "Pago_ordenId_key" ON "Pago"("ordenId");

-- CreateIndex
CREATE INDEX "PaymentAttempt_pagoId_idx" ON "PaymentAttempt"("pagoId");

-- CreateIndex
CREATE INDEX "PaymentAttempt_providerIntentId_idx" ON "PaymentAttempt"("providerIntentId");

-- CreateIndex
CREATE INDEX "Refund_pagoId_idx" ON "Refund"("pagoId");

-- CreateIndex
CREATE INDEX "Refund_stripeRefundId_idx" ON "Refund"("stripeRefundId");

-- CreateIndex
CREATE UNIQUE INDEX "StripeEvent_eventId_key" ON "StripeEvent"("eventId");

-- CreateIndex
CREATE UNIQUE INDEX "Envio_ordenId_key" ON "Envio"("ordenId");

-- CreateIndex
CREATE INDEX "EnvioEvento_envioId_ocurridoEn_idx" ON "EnvioEvento"("envioId", "ocurridoEn");

-- CreateIndex
CREATE INDEX "InventarioMovimiento_varianteId_creadoEn_idx" ON "InventarioMovimiento"("varianteId", "creadoEn");

-- CreateIndex
CREATE INDEX "ReservaStock_ordenId_idx" ON "ReservaStock"("ordenId");

-- CreateIndex
CREATE UNIQUE INDEX "ReservaStock_varianteId_ordenId_key" ON "ReservaStock"("varianteId", "ordenId");

-- CreateIndex
CREATE UNIQUE INDEX "ChatConversacion_ordenId_key" ON "ChatConversacion"("ordenId");

-- CreateIndex
CREATE INDEX "ChatMensaje_conversacionId_creadoEn_idx" ON "ChatMensaje"("conversacionId", "creadoEn");

-- CreateIndex
CREATE INDEX "Resena_productoId_creadoEn_idx" ON "Resena"("productoId", "creadoEn");

-- CreateIndex
CREATE UNIQUE INDEX "Resena_productoId_compradorId_ordenId_key" ON "Resena"("productoId", "compradorId", "ordenId");

-- CreateIndex
CREATE UNIQUE INDEX "Factura_ordenId_key" ON "Factura"("ordenId");

-- CreateIndex
CREATE UNIQUE INDEX "Factura_numero_key" ON "Factura"("numero");

-- CreateIndex
CREATE INDEX "FacturaItem_facturaId_idx" ON "FacturaItem"("facturaId");

-- CreateIndex
CREATE INDEX "AuditLog_actorUsuarioId_creadoEn_idx" ON "AuditLog"("actorUsuarioId", "creadoEn");

-- CreateIndex
CREATE INDEX "AuditLog_entidad_creadoEn_idx" ON "AuditLog"("entidad", "creadoEn");

-- CreateIndex
CREATE INDEX "TicketSoporte_creadorUsuarioId_creadoEn_idx" ON "TicketSoporte"("creadorUsuarioId", "creadoEn");

-- CreateIndex
CREATE INDEX "TicketSoporte_estado_creadoEn_idx" ON "TicketSoporte"("estado", "creadoEn");

-- AddForeignKey
ALTER TABLE "Direccion" ADD CONSTRAINT "Direccion_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vendedor" ADD CONSTRAINT "Vendedor_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Producto" ADD CONSTRAINT "Producto_vendedorId_fkey" FOREIGN KEY ("vendedorId") REFERENCES "Vendedor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Producto" ADD CONSTRAINT "Producto_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "Categoria"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ImagenProducto" ADD CONSTRAINT "ImagenProducto_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "Producto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VarianteProducto" ADD CONSTRAINT "VarianteProducto_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "Producto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Orden" ADD CONSTRAINT "Orden_compradorId_fkey" FOREIGN KEY ("compradorId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Orden" ADD CONSTRAINT "Orden_vendedorId_fkey" FOREIGN KEY ("vendedorId") REFERENCES "Vendedor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemOrden" ADD CONSTRAINT "ItemOrden_ordenId_fkey" FOREIGN KEY ("ordenId") REFERENCES "Orden"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemOrden" ADD CONSTRAINT "ItemOrden_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "Producto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemOrden" ADD CONSTRAINT "ItemOrden_varianteId_fkey" FOREIGN KEY ("varianteId") REFERENCES "VarianteProducto"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pago" ADD CONSTRAINT "Pago_ordenId_fkey" FOREIGN KEY ("ordenId") REFERENCES "Orden"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentAttempt" ADD CONSTRAINT "PaymentAttempt_pagoId_fkey" FOREIGN KEY ("pagoId") REFERENCES "Pago"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Refund" ADD CONSTRAINT "Refund_pagoId_fkey" FOREIGN KEY ("pagoId") REFERENCES "Pago"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Envio" ADD CONSTRAINT "Envio_ordenId_fkey" FOREIGN KEY ("ordenId") REFERENCES "Orden"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EnvioEvento" ADD CONSTRAINT "EnvioEvento_envioId_fkey" FOREIGN KEY ("envioId") REFERENCES "Envio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventarioMovimiento" ADD CONSTRAINT "InventarioMovimiento_varianteId_fkey" FOREIGN KEY ("varianteId") REFERENCES "VarianteProducto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReservaStock" ADD CONSTRAINT "ReservaStock_varianteId_fkey" FOREIGN KEY ("varianteId") REFERENCES "VarianteProducto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReservaStock" ADD CONSTRAINT "ReservaStock_ordenId_fkey" FOREIGN KEY ("ordenId") REFERENCES "Orden"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatConversacion" ADD CONSTRAINT "ChatConversacion_ordenId_fkey" FOREIGN KEY ("ordenId") REFERENCES "Orden"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatMensaje" ADD CONSTRAINT "ChatMensaje_conversacionId_fkey" FOREIGN KEY ("conversacionId") REFERENCES "ChatConversacion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Resena" ADD CONSTRAINT "Resena_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "Producto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Resena" ADD CONSTRAINT "Resena_compradorId_fkey" FOREIGN KEY ("compradorId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Resena" ADD CONSTRAINT "Resena_ordenId_fkey" FOREIGN KEY ("ordenId") REFERENCES "Orden"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Factura" ADD CONSTRAINT "Factura_ordenId_fkey" FOREIGN KEY ("ordenId") REFERENCES "Orden"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FacturaItem" ADD CONSTRAINT "FacturaItem_facturaId_fkey" FOREIGN KEY ("facturaId") REFERENCES "Factura"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
