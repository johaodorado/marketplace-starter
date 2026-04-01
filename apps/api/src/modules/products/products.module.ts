import { Module } from '@nestjs/common'
import { ProductsController } from './products.controller'
import { ProductsService } from './products.service'
import { PrismaModule } from '../../prisma/prisma.module'
import { StorageModule } from '../../common/storage/storage.module'

@Module({
  imports: [PrismaModule, StorageModule],
  controllers: [ProductsController],
  providers: [ProductsService],
})
export class ProductsModule {}