import { Logger } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { buildValidationPipe } from './common/pipes/validation.pipe'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  const port = Number(process.env.PORT ?? 3000)

  app.setGlobalPrefix('api')
  app.useGlobalPipes(buildValidationPipe())
  app.enableCors()

  await app.listen(port)
  Logger.log(`API corriendo en http://localhost:${port}/api`, 'Bootstrap')
}

bootstrap()
