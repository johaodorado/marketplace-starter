import {
  ForbiddenException,
  Injectable,
  NotFoundException
} from '@nestjs/common'
import { EstadoProducto, EstadoVendedor } from '@prisma/client'
import { PrismaService } from '../../prisma/prisma.service'
import { CreateProductDto } from './dto/create-product.dto'
import { UpdateProductDto } from './dto/update-product.dto'

import { UpdateProductStatusDto } from './dto/update-product-status.dto'
import { AddProductImageDto } from './dto/add-product-image.dto'
import { ConflictException } from '@nestjs/common'
import { CreateProductVariantDto } from './dto/create-product-variant.dto'
import { UpdateProductVariantDto } from './dto/update-product-variant.dto'
import { TipoMovimientoInventario } from '@prisma/client'
import { AdjustStockDto } from './dto/adjust-stock.dto'
import { CloudinaryService } from '../../common/storage/cloudinary.service'



@Injectable()
export class ProductsService {
  constructor(
  private readonly prisma: PrismaService,
  private readonly cloudinaryService: CloudinaryService,
) {}

  async listPublic() {
    return this.prisma.producto.findMany({
      where: {
        estado: EstadoProducto.ACTIVO
      },
      orderBy: {
        creadoEn: 'desc'
      },
      include: {
        categoria: true,
        imagenes: true,
        vendedor: {
          select: {
            id: true,
            nombreTienda: true,
            estado: true
          }
        }
      }
    })
  }


  
  async getPublicById(id: string) {
    const product = await this.prisma.producto.findFirst({
      where: {
        id,
        estado: EstadoProducto.ACTIVO
      },
      include: {
        categoria: true,
        imagenes: true,
        variantes: true,
        vendedor: {
          select: {
            id: true,
            nombreTienda: true,
            estado: true
          }
        }
      }
    })

    if (!product) {
      throw new NotFoundException('Producto no encontrado')
    }

    return product
  }

  async listSellerProducts(usuarioId: string) {
    const seller = await this.prisma.vendedor.findUnique({
      where: { usuarioId }
    })

    if (!seller) {
      throw new NotFoundException('Vendedor no encontrado')
    }

    return this.prisma.producto.findMany({
      where: {
        vendedorId: seller.id
      },
      orderBy: {
        creadoEn: 'desc'
      },
      include: {
        categoria: true,
        imagenes: true,
        variantes: true
      }
    })
  }

  async getSellerProductById(usuarioId: string, id: string) {
    const seller = await this.prisma.vendedor.findUnique({
      where: { usuarioId }
    })

    if (!seller) {
      throw new NotFoundException('Vendedor no encontrado')
    }

    const product = await this.prisma.producto.findFirst({
      where: {
        id,
        vendedorId: seller.id
      },
      include: {
        categoria: true,
        imagenes: true,
        variantes: true
      }
    })

    if (!product) {
      throw new NotFoundException('Producto no encontrado')
    }

    return product
  }

  async create(usuarioId: string, dto: CreateProductDto) {
    const seller = await this.prisma.vendedor.findUnique({
      where: { usuarioId }
    })

    if (!seller) {
      throw new NotFoundException('Vendedor no encontrado')
    }

    if (seller.estado !== EstadoVendedor.APROBADO) {
      throw new ForbiddenException('Tu cuenta de vendedor no está aprobada')
    }

    if (dto.categoriaId) {
      const category = await this.prisma.categoria.findUnique({
        where: { id: dto.categoriaId }
      })

      if (!category) {
        throw new NotFoundException('Categoría no encontrada')
      }
    }

    return this.prisma.producto.create({
      data: {
        vendedorId: seller.id,
        categoriaId: dto.categoriaId,
        titulo: dto.titulo,
        descripcion: dto.descripcion,
        precioBase: dto.precioBase,
        moneda: dto.moneda ?? 'USD',
        estado: EstadoProducto.BORRADOR
      },
      include: {
        categoria: true
      }
    })
  }

  async update(usuarioId: string, id: string, dto: UpdateProductDto) {
    const seller = await this.prisma.vendedor.findUnique({
      where: { usuarioId }
    })

    if (!seller) {
      throw new NotFoundException('Vendedor no encontrado')
    }

    const product = await this.prisma.producto.findFirst({
      where: {
        id,
        vendedorId: seller.id
      }
    })

    if (!product) {
      throw new NotFoundException('Producto no encontrado')
    }

    if (dto.categoriaId) {
      const category = await this.prisma.categoria.findUnique({
        where: { id: dto.categoriaId }
      })

      if (!category) {
        throw new NotFoundException('Categoría no encontrada')
      }
    }

    return this.prisma.producto.update({
      where: { id },
      data: {
        titulo: dto.titulo ?? product.titulo,
        descripcion: dto.descripcion ?? product.descripcion,
        categoriaId: dto.categoriaId ?? product.categoriaId,
        precioBase: dto.precioBase ?? product.precioBase,
        moneda: dto.moneda ?? product.moneda
      },
      include: {
        categoria: true,
        imagenes: true,
        variantes: true
      }
    })
  }

  async updateStatus(usuarioId: string, id: string, dto: UpdateProductStatusDto) {
  const seller = await this.prisma.vendedor.findUnique({
    where: { usuarioId }
  })

  if (!seller) {
    throw new NotFoundException('Vendedor no encontrado')
  }

  const product = await this.prisma.producto.findFirst({
    where: {
      id,
      vendedorId: seller.id
    }
  })

  if (!product) {
    throw new NotFoundException('Producto no encontrado')
  }

  return this.prisma.producto.update({
    where: { id },
    data: {
      estado: dto.estado
    },
    include: {
      categoria: true,
      imagenes: true,
      variantes: true
    }
  })
  
}
async addImage(usuarioId: string, productId: string, dto: AddProductImageDto) {
  const seller = await this.prisma.vendedor.findUnique({
    where: { usuarioId }
  })

  if (!seller) {
    throw new NotFoundException('Vendedor no encontrado')
  }

  const product = await this.prisma.producto.findFirst({
    where: {
      id: productId,
      vendedorId: seller.id
    }
  })

  if (!product) {
    throw new NotFoundException('Producto no encontrado')
  }

  return this.prisma.imagenProducto.create({
    data: {
      productoId: productId,
      url: dto.url,
      orden: dto.orden ?? 0
    }
  })
}

async deleteImage(usuarioId: string, productId: string, imageId: string) {
  const seller = await this.prisma.vendedor.findUnique({
    where: { usuarioId }
  })

  if (!seller) {
    throw new NotFoundException('Vendedor no encontrado')
  }

  const product = await this.prisma.producto.findFirst({
    where: {
      id: productId,
      vendedorId: seller.id
    }
  })

  if (!product) {
    throw new NotFoundException('Producto no encontrado')
  }

  const image = await this.prisma.imagenProducto.findFirst({
    where: {
      id: imageId,
      productoId: productId
    }
  })

  if (!image) {
    throw new NotFoundException('Imagen no encontrada')
  }

  await this.prisma.imagenProducto.delete({
    where: { id: imageId }
  })

  return { ok: true }
}
async addVariant(usuarioId: string, productId: string, dto: CreateProductVariantDto) {
  const seller = await this.prisma.vendedor.findUnique({
    where: { usuarioId }
  })

  if (!seller) {
    throw new NotFoundException('Vendedor no encontrado')
  }

  const product = await this.prisma.producto.findFirst({
    where: {
      id: productId,
      vendedorId: seller.id
    }
  })

  if (!product) {
    throw new NotFoundException('Producto no encontrado')
  }

  if (dto.sku) {
    const existingSku = await this.prisma.varianteProducto.findUnique({
      where: { sku: dto.sku }
    })

    if (existingSku) {
      throw new ConflictException('Ya existe una variante con ese SKU')
    }
  }

  return this.prisma.varianteProducto.create({
    data: {
      productoId: productId,
      nombre: dto.nombre,
      sku: dto.sku,
      precio: dto.precio,
      stock: 0
    }
  })
}

async updateVariant(
  usuarioId: string,
  productId: string,
  variantId: string,
  dto: UpdateProductVariantDto
) {
  const seller = await this.prisma.vendedor.findUnique({
    where: { usuarioId }
  })

  if (!seller) {
    throw new NotFoundException('Vendedor no encontrado')
  }

  const product = await this.prisma.producto.findFirst({
    where: {
      id: productId,
      vendedorId: seller.id
    }
  })

  if (!product) {
    throw new NotFoundException('Producto no encontrado')
  }

  const variant = await this.prisma.varianteProducto.findFirst({
    where: {
      id: variantId,
      productoId: productId
    }
  })

  if (!variant) {
    throw new NotFoundException('Variante no encontrada')
  }

  if (dto.sku && dto.sku !== variant.sku) {
    const existingSku = await this.prisma.varianteProducto.findUnique({
      where: { sku: dto.sku }
    })

    if (existingSku) {
      throw new ConflictException('Ya existe una variante con ese SKU')
    }
  }

  return this.prisma.varianteProducto.update({
    where: { id: variantId },
    data: {
      nombre: dto.nombre ?? variant.nombre,
      sku: dto.sku ?? variant.sku,
      precio: dto.precio ?? variant.precio
    }
  })
}
async adjustStock(
  usuarioId: string,
  productId: string,
  variantId: string,
  dto: AdjustStockDto
) {
  const seller = await this.prisma.vendedor.findUnique({
    where: { usuarioId }
  })

  if (!seller) {
    throw new NotFoundException('Vendedor no encontrado')
  }

  const product = await this.prisma.producto.findFirst({
    where: {
      id: productId,
      vendedorId: seller.id
    }
  })

  if (!product) {
    throw new NotFoundException('Producto no encontrado')
  }

  const variant = await this.prisma.varianteProducto.findFirst({
    where: {
      id: variantId,
      productoId: productId
    }
  })

  if (!variant) {
    throw new NotFoundException('Variante no encontrada')
  }

  const nuevoStock = variant.stock + dto.cantidad

  if (nuevoStock < 0) {
    throw new ForbiddenException('Stock insuficiente para realizar el ajuste')
  }

  const tipo =
    dto.cantidad > 0
      ? TipoMovimientoInventario.INGRESO
      : TipoMovimientoInventario.EGRESO

  return this.prisma.$transaction(async (tx) => {
    const updatedVariant = await tx.varianteProducto.update({
      where: { id: variantId },
      data: {
        stock: nuevoStock
      }
    })

    await tx.inventarioMovimiento.create({
      data: {
        varianteId: variantId,
        tipo,
        cantidad: Math.abs(dto.cantidad),
        motivo: dto.motivo
      }
    })

    return updatedVariant
  })
}

async listStockMovements(usuarioId: string, productId: string, variantId: string) {
  const seller = await this.prisma.vendedor.findUnique({
    where: { usuarioId }
  })

  if (!seller) {
    throw new NotFoundException('Vendedor no encontrado')
  }

  const product = await this.prisma.producto.findFirst({
    where: {
      id: productId,
      vendedorId: seller.id
    }
  })

  if (!product) {
    throw new NotFoundException('Producto no encontrado')
  }

  const variant = await this.prisma.varianteProducto.findFirst({
    where: {
      id: variantId,
      productoId: productId
    }
  })

  if (!variant) {
    throw new NotFoundException('Variante no encontrada')
  }

  return this.prisma.inventarioMovimiento.findMany({
    where: {
      varianteId: variantId
    },
    orderBy: {
      creadoEn: 'desc'
    }
  })
}

private async getStoreSellerId() {
  const seller = await this.prisma.vendedor.findFirst({
    where: {
      estado: EstadoVendedor.APROBADO,
    },
    orderBy: {
      creadoEn: 'asc',
    },
  })

  if (!seller) {
    throw new NotFoundException(
      'No existe un vendedor base aprobado para la tienda',
    )
  }

  return seller.id
}

async listAdmin() {
  return this.prisma.producto.findMany({
    orderBy: {
      creadoEn: 'desc',
    },
    include: {
      categoria: true,
      imagenes: true,
      variantes: true,
    },
  })
}

async createAdmin(dto: CreateProductDto) {
  const sellerId = await this.getStoreSellerId()

  if (dto.categoriaId) {
    const category = await this.prisma.categoria.findUnique({
      where: { id: dto.categoriaId },
    })

    if (!category) {
      throw new NotFoundException('Categoría no encontrada')
    }
  }

  return this.prisma.producto.create({
    data: {
      vendedorId: sellerId,
      categoriaId: dto.categoriaId,
      titulo: dto.titulo,
      descripcion: dto.descripcion,
      precioBase: dto.precioBase,
      moneda: dto.moneda ?? 'USD',
      estado: EstadoProducto.BORRADOR,
    },
    include: {
      categoria: true,
      imagenes: true,
      variantes: true,
    },
  })
}

async addImageAdmin(productId: string, dto: AddProductImageDto) {
  const product = await this.prisma.producto.findUnique({
    where: { id: productId },
  })

  if (!product) {
    throw new NotFoundException('Producto no encontrado')
  }

  return this.prisma.imagenProducto.create({
    data: {
      productoId: productId,
      url: dto.url,
      orden: dto.orden ?? 0,
    },
  })
}

async addVariantAdmin(productId: string, dto: CreateProductVariantDto) {
  const product = await this.prisma.producto.findUnique({
    where: { id: productId },
  })

  if (!product) {
    throw new NotFoundException('Producto no encontrado')
  }

  if (dto.sku) {
    const existingSku = await this.prisma.varianteProducto.findUnique({
      where: { sku: dto.sku },
    })

    if (existingSku) {
      throw new ConflictException('Ya existe una variante con ese SKU')
    }
  }

  return this.prisma.varianteProducto.create({
    data: {
      productoId: productId,
      nombre: dto.nombre,
      sku: dto.sku,
      precio: dto.precio,
      stock: 0,
    },
  })
}

async adjustStockAdmin(productId: string, variantId: string, dto: AdjustStockDto) {
  const product = await this.prisma.producto.findUnique({
    where: { id: productId },
  })

  if (!product) {
    throw new NotFoundException('Producto no encontrado')
  }

  const variant = await this.prisma.varianteProducto.findFirst({
    where: {
      id: variantId,
      productoId: productId,
    },
  })

  if (!variant) {
    throw new NotFoundException('Variante no encontrada')
  }

  const nuevoStock = variant.stock + dto.cantidad

  if (nuevoStock < 0) {
    throw new ForbiddenException('Stock insuficiente para realizar el ajuste')
  }

  const tipo =
    dto.cantidad > 0
      ? TipoMovimientoInventario.INGRESO
      : TipoMovimientoInventario.EGRESO

  return this.prisma.$transaction(async (tx) => {
    const updatedVariant = await tx.varianteProducto.update({
      where: { id: variantId },
      data: {
        stock: nuevoStock,
      },
    })

    await tx.inventarioMovimiento.create({
      data: {
        varianteId: variantId,
        tipo,
        cantidad: Math.abs(dto.cantidad),
        motivo: dto.motivo,
      },
    })

    return updatedVariant
  })
}

async updateStatusAdmin(id: string, dto: UpdateProductStatusDto) {
  const product = await this.prisma.producto.findUnique({
    where: { id },
  })

  if (!product) {
    throw new NotFoundException('Producto no encontrado')
  }

  return this.prisma.producto.update({
    where: { id },
    data: {
      estado: dto.estado,
    },
    include: {
      categoria: true,
      imagenes: true,
      variantes: true,
    },
  })
}


async uploadImage(productId: string, file: Express.Multer.File) {
  const product = await this.prisma.producto.findUnique({
    where: { id: productId },
  })

  if (!product) {
    throw new NotFoundException('Producto no encontrado')
  }

  const uploaded = await this.cloudinaryService.uploadProductImage(file, productId)

  const lastImage = await this.prisma.imagenProducto.findFirst({
    where: { productoId: productId },
    orderBy: { orden: 'desc' },
  })

  const nextOrder = lastImage ? lastImage.orden + 1 : 0

  return this.prisma.imagenProducto.create({
    data: {
      productoId: productId,
      url: uploaded.secure_url,
      orden: nextOrder,
    },
  })
}



async updateAdmin(id: string, dto: UpdateProductDto) {
  const product = await this.prisma.producto.findUnique({
    where: { id },
  })

  if (!product) {
    throw new NotFoundException('Producto no encontrado')
  }

  if (dto.categoriaId) {
    const category = await this.prisma.categoria.findUnique({
      where: { id: dto.categoriaId },
    })

    if (!category) {
      throw new NotFoundException('Categoría no encontrada')
    }
  }

  return this.prisma.producto.update({
    where: { id },
    data: {
      titulo: dto.titulo ?? product.titulo,
      descripcion: dto.descripcion ?? product.descripcion,
      categoriaId: dto.categoriaId ?? product.categoriaId,
      precioBase: dto.precioBase ?? product.precioBase,
      moneda: dto.moneda ?? product.moneda,
    },
    include: {
      categoria: true,
      imagenes: true,
      variantes: true,
    },
  })
}

async getAdminById(id: string) {
  const product = await this.prisma.producto.findUnique({
    where: { id },
    include: {
      categoria: true,
      imagenes: true,
      variantes: true,
    },
  })

  if (!product) {
    throw new NotFoundException('Producto no encontrado')
  }

  return product
}


async deleteImageAdmin(productId: string, imageId: string) {
  const product = await this.prisma.producto.findUnique({
    where: { id: productId },
  })

  if (!product) {
    throw new NotFoundException('Producto no encontrado')
  }

  const image = await this.prisma.imagenProducto.findFirst({
    where: {
      id: imageId,
      productoId: productId,
    },
  })

  if (!image) {
    throw new NotFoundException('Imagen no encontrada')
  }

  await this.prisma.imagenProducto.delete({
    where: { id: imageId },
  })

  return { ok: true }
}

async moveImageAdmin(productId: string, imageId: string, direction: 'up' | 'down') {
  const product = await this.prisma.producto.findUnique({
    where: { id: productId },
  })

  if (!product) {
    throw new NotFoundException('Producto no encontrado')
  }

  const images = await this.prisma.imagenProducto.findMany({
    where: { productoId: productId },
    orderBy: { orden: 'asc' },
  })

  const currentIndex = images.findIndex((img) => img.id === imageId)

  if (currentIndex === -1) {
    throw new NotFoundException('Imagen no encontrada')
  }

  const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1

  if (targetIndex < 0 || targetIndex >= images.length) {
    return { ok: true }
  }

  const currentImage = images[currentIndex]
  const targetImage = images[targetIndex]

  await this.prisma.$transaction([
    this.prisma.imagenProducto.update({
      where: { id: currentImage.id },
      data: { orden: targetImage.orden },
    }),
    this.prisma.imagenProducto.update({
      where: { id: targetImage.id },
      data: { orden: currentImage.orden },
    }),
  ])

  return { ok: true }
}

async setPrimaryImageAdmin(productId: string, imageId: string) {
  const product = await this.prisma.producto.findUnique({
    where: { id: productId },
  })

  if (!product) {
    throw new NotFoundException('Producto no encontrado')
  }

  const images = await this.prisma.imagenProducto.findMany({
    where: { productoId: productId },
    orderBy: { orden: 'asc' },
  })

  const selected = images.find((img) => img.id === imageId)

  if (!selected) {
    throw new NotFoundException('Imagen no encontrada')
  }

  const reordered = [
    selected,
    ...images.filter((img) => img.id !== imageId),
  ]

  await this.prisma.$transaction(
    reordered.map((img, index) =>
      this.prisma.imagenProducto.update({
        where: { id: img.id },
        data: { orden: index },
      }),
    ),
  )

  return { ok: true }
}


}
