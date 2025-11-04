import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getAppInfo() {
    return this.appService.getAppInfo();
  }

  @Get('health')
  getHealthCheck() {
    return this.appService.getHealthCheck();
  }
}