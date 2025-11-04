import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectConnection } from '@nestjs/typeorm';
import { Connection } from 'typeorm';

@Injectable()
export class AppService {
  constructor(
    private readonly configService: ConfigService,
    @InjectConnection() private readonly connection: Connection,
  ) {}

  getAppInfo() {
    return {
      success: true,
      data: {
        name: 'TaskForge API',
        version: '1.0.0',
        description: 'Full Stack Project Management Application Backend',
        environment: this.configService.get<string>('app.nodeEnv'),
        apiPrefix: this.configService.get<string>('app.apiPrefix'),
        documentation: `/api/v1/docs`,
      },
      timestamp: new Date().toISOString(),
    };
  }

  async getHealthCheck() {
    const isDbConnected = this.connection.isInitialized;
    const dbStatus = isDbConnected ? 'connected' : 'disconnected';

    return {
      success: true,
      data: {
        status: isDbConnected ? 'healthy' : 'unhealthy',
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        database: {
          status: dbStatus,
          type: 'postgres',
        },
        memory: {
          used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
          total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
          unit: 'MB',
        },
      },
    };
  }
}