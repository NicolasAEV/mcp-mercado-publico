import { Module } from '@nestjs/common';
import { McpService } from './mcp.service';
import { MercadoPublicoModule } from '../mercado-publico/mercado-publico.module';

@Module({
  imports: [MercadoPublicoModule],
  providers: [McpService],
})
export class McpModule {}
