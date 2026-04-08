import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { mcpServer } from './mcp-server.js';
import { MercadoPublicoService } from '../mercado-publico/mercado-publico.service.js';
import { registerAyudaTools } from './tools/ayuda.tools.js';
import { registerEstructuraTools } from './tools/estructura.tools.js';
import { registerLicitacionesTools } from './tools/licitaciones.tools.js';
import { registerOrdenesDeCompraTools } from './tools/ordenes-compra.tools.js';
import { registerEmpresasTools } from './tools/empresas.tools.js';

@Injectable()
export class McpService implements OnModuleInit {
  private readonly logger = new Logger(McpService.name);

  constructor(private readonly mercadoPublicoService: MercadoPublicoService) {}

  onModuleInit(): void {
    registerAyudaTools(mcpServer);
    registerEstructuraTools(mcpServer);
    registerLicitacionesTools(mcpServer, this.mercadoPublicoService);
    registerOrdenesDeCompraTools(mcpServer, this.mercadoPublicoService);
    registerEmpresasTools(mcpServer, this.mercadoPublicoService);
    this.logger.log(
      'MCP tools registradas: ayuda, estructura, consultas, ejemplos_url, licitaciones, ordenes-compra, empresas',
    );
  }
}
