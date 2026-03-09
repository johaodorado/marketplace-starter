import {
  ConflictException,
  Injectable,
  NotFoundException
} from '@nestjs/common'
import { slugify } from '../../common/utils/slug'
import { PrismaService } from '../../prisma/prisma.service'
import { CreateCategoryDto } from './dto/create-category.dto'
import { UpdateCategoryDto } from './dto/update-category.dto'

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async list() {
    return this.prisma.categoria.findMany({
      orderBy: {
        nombre: 'asc'
      },
      include: {
        _count: {
          select: {
            productos: true
          }
        }
      }
    })
  }

  async getById(id: string) {
    const category = await this.prisma.categoria.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            productos: true
          }
        }
      }
    })

    if (!category) {
      throw new NotFoundException('Categoría no encontrada')
    }

    return category
  }

  async getBySlug(slug: string) {
    const category = await this.prisma.categoria.findUnique({
      where: { slug },
      include: {
        _count: {
          select: {
            productos: true
          }
        }
      }
    })

    if (!category) {
      throw new NotFoundException('Categoría no encontrada')
    }

    return category
  }

  async create(dto: CreateCategoryDto) {
    const slug = slugify(dto.slug ?? dto.nombre)
    await this.ensureSlugAvailable(slug)

    return this.prisma.categoria.create({
      data: {
        nombre: dto.nombre,
        slug
      }
    })
  }

  async update(id: string, dto: UpdateCategoryDto) {
    const category = await this.prisma.categoria.findUnique({
      where: { id }
    })

    if (!category) {
      throw new NotFoundException('Categoría no encontrada')
    }

    const slug = dto.slug
      ? slugify(dto.slug)
      : dto.nombre
        ? slugify(dto.nombre)
        : category.slug

    await this.ensureSlugAvailable(slug, id)

    return this.prisma.categoria.update({
      where: { id },
      data: {
        nombre: dto.nombre ?? category.nombre,
        slug
      }
    })
  }

  private async ensureSlugAvailable(slug: string, currentId?: string) {
    const existing = await this.prisma.categoria.findFirst({
      where: {
        slug,
        id: currentId ? { not: currentId } : undefined
      }
    })

    if (existing) {
      throw new ConflictException('Ya existe una categoría con ese slug')
    }
  }
}