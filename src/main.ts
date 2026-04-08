#!/usr/bin/env node
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { mcpServer } from './mcp/mcp-server';

async function bootstrap() {
  // Crear la app NestJS en modo headless (sin HTTP) para que los providers/services
  // se inicialicen (registrando las MCP tools via McpService.onModuleInit).
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: false,
  });

  await app.init();

  // Conectar el McpServer al transporte stdio.
  // Compatible con Claude Desktop, Cursor, y cualquier cliente MCP local.
  const transport = new StdioServerTransport();
  await mcpServer.connect(transport);

  // NOTA: No logueamos a stdout para no corromper el protocolo JSON-RPC.
  process.stderr.write('MCP Mercado Público listo en modo stdio\n');
}

bootstrap().catch((err) => {
  process.stderr.write(`Error iniciando MCP: ${err}\n`);
  process.exit(1);
});
