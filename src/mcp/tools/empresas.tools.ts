import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { MercadoPublicoService } from '../../mercado-publico/mercado-publico.service.js';
import { TICKET_SCHEMA } from '../constants/tool-schemas.constants.js';
import { resolveTicket } from '../../common/utils/resolve-ticket.util.js';

export function registerEmpresasTools(
  server: McpServer,
  service: MercadoPublicoService,
): void {
  server.registerTool(
    'buscar_proveedor',
    {
      title: 'Buscar Proveedor por RUT',
      description:
        'Busca un proveedor en el registro de Mercado Público por su RUT. ' +
        'Retorna el código numérico interno, nombre y datos de registro del proveedor. ' +
        'El código retornado (CodigoProveedor) puede usarse en buscar_licitaciones y buscar_ordenes_de_compra.',
      inputSchema: {
        ticket: TICKET_SCHEMA,
        rut: z
          .string()
          .describe(
            'RUT de la empresa proveedora con puntos, guión y dígito verificador. ' +
              'Ejemplo: 70.017.820-k',
          ),
      },
    },
    async ({ ticket, rut }) => {
      const resolvedTicket = resolveTicket(ticket);
      const data = await service.buscarProveedor(resolvedTicket, rut);
      return {
        content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
      };
    },
  );

  server.registerTool(
    'listar_compradores',
    {
      title: 'Listar Organismos Compradores',
      description:
        'Retorna la lista completa de organismos públicos (compradores) registrados en Mercado Público. ' +
        'Incluye nombre y código numérico de cada organismo. ' +
        'El código (CodigoOrganismo) puede usarse en buscar_licitaciones y buscar_ordenes_de_compra. ' +
        'Para buscar por nombre de municipio o institución usa la herramienta buscar_organismo.',
      inputSchema: {
        ticket: TICKET_SCHEMA,
      },
    },
    async ({ ticket }) => {
      const resolvedTicket = resolveTicket(ticket);
      const data = await service.buscarCompradores(resolvedTicket);
      return {
        content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
      };
    },
  );

  server.registerTool(
    'buscar_organismo',
    {
      title: 'Buscar Organismo Público por Nombre',
      description:
        'Busca organismos públicos (municipios, ministerios, servicios, etc.) por nombre o parte del nombre. ' +
        'Útil para encontrar el CodigoOrganismo de una institución o municipio específico, ' +
        'como "Alto del Carmen", "Municipalidad de Santiago" o "Ministerio de Salud". ' +
        'El CodigoOrganismo retornado puede usarse directamente en buscar_licitaciones y buscar_ordenes_de_compra.',
      inputSchema: {
        ticket: TICKET_SCHEMA,
        nombre: z
          .string()
          .describe(
            'Nombre o parte del nombre del organismo a buscar. ' +
              'La búsqueda es insensible a mayúsculas/minúsculas. ' +
              'Ejemplos: "Alto del Carmen", "Santiago", "Ministerio de Salud", "CONAF".',
          ),
      },
    },
    async ({ ticket, nombre }) => {
      const resolvedTicket = resolveTicket(ticket);
      const data = await service.buscarOrganismoPorNombre(
        resolvedTicket,
        nombre,
      );
      return {
        content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
      };
    },
  );
}
