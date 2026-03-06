import { Controller, Get } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

@Controller('health')
export class HealthController {
  constructor(private readonly configService: ConfigService) {}

  @Get()
  getHealth() {
    return {
      success: true,
      service: this.configService.get<string>('app.name'),
      env: this.configService.get<string>('app.nodeEnv'),
      timestamp: new Date().toISOString()
    }
  }
}
