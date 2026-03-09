/*
  Warnings:

  - Added the required column `updatedAt` to the `Categoria` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Categoria_slug_idx";

-- AlterTable
ALTER TABLE "Categoria" ADD COLUMN     "activa" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "descripcion" TEXT,
ADD COLUMN     "parentId" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE INDEX "Categoria_parentId_idx" ON "Categoria"("parentId");

-- CreateIndex
CREATE INDEX "Producto_categoriaId_idx" ON "Producto"("categoriaId");

-- AddForeignKey
ALTER TABLE "Categoria" ADD CONSTRAINT "Categoria_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Categoria"("id") ON DELETE SET NULL ON UPDATE CASCADE;
