import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { MercadoPublicoService } from '../../mercado-publico/mercado-publico.service.js';
import {
  TICKET_SCHEMA,
  FECHA_SCHEMA,
  CODIGO_PROVEEDOR_SCHEMA,
  CODIGO_ORGANISMO_SCHEMA,
  NOMBRE_ORGANISMO_SCHEMA,
} from '../constants/tool-schemas.constants.js';
import { resolveTicket } from '../../common/utils/resolve-ticket.util.js';

export function registerLicitacionesTools(
  server: McpServer,
  service: MercadoPublicoService,
): void {
  server.registerTool(
    'buscar_licitaciones',
    {
      title: 'Buscar Licitaciones',
      description:
        'Busca licitaciones en Mercado Público (ChileCompra). ' +
        'Sin parámetros opcionales retorna las licitaciones del día actual. ' +
        'Puedes filtrar por fecha, estado, proveedor u organismo. ' +
        'Para buscar por organismo usa nombreOrganismo (nombre o parte) o codigoOrganismo (código numérico). ' +
        'Sin fecha y con organismo/proveedor, busca automáticamente los últimos 30 días. ' +
        'Estados válidos: activas (publicadas hoy), publicada, cerrada, desierta, adjudicada, revocada, suspendida, todos. ' +
        'Códigos en la respuesta: Publicada=5, Cerrada=6, Desierta=7, Adjudicada=8, Revocada=18, Suspendida=19.',
      inputSchema: {
        ticket: TICKET_SCHEMA,
        fecha: FECHA_SCHEMA,
        estado: z
          .string()
          .optional()
          .describe(
            'Estado de la licitación: activas | publicada | cerrada | desierta | adjudicada | ' +
              'revocada | suspendida | todos. Usa "activas" para ver todas las publicadas hoy.',
          ),
        codigoProveedor: CODIGO_PROVEEDOR_SCHEMA,
        codigoOrganismo: CODIGO_ORGANISMO_SCHEMA,
        nombreOrganismo: NOMBRE_ORGANISMO_SCHEMA,
      },
    },
    async ({
      ticket,
      fecha,
      estado,
      codigoProveedor,
      codigoOrganismo,
      nombreOrganismo,
    }) => {
      const resolvedTicket = resolveTicket(ticket);
      const data = await service.getLicitaciones({
        ticket: resolvedTicket,
        fecha,
        estado,
        codigoProveedor,
        codigoOrganismo,
        nombreOrganismo,
      });
      return {
        content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
      };
    },
  );

  server.registerTool(
    'obtener_licitacion',
    {
      title: 'Obtener Licitación por Código',
      description:
        'Obtiene el detalle completo de una licitación específica por su código único. ' +
        'Formato del código: XXXX-X-XXXXX (ej: 1509-5-L114). ' +
        'Retorna info detallada: ítems, fechas, montos, organismo comprador, adjudicación y estado.',
      inputSchema: {
        ticket: TICKET_SCHEMA,
        codigo: z
          .string()
          .describe(
            'Código único de la licitación. Formato: XXXX-X-XXXXX (ej: 1509-5-L114).',
          ),
      },
    },
    async ({ ticket, codigo }) => {
      const resolvedTicket = resolveTicket(ticket);
      const data = await service.getLicitacionPorCodigo(resolvedTicket, codigo);
      return {
        content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
      };
    },
  );

  server.registerTool(
    'buscar_licitaciones_rango',
    {
      title: 'Buscar Licitaciones por Rango de Fechas',
      description:
        'Busca licitaciones en un rango de fechas (máximo 30 días). ' +
        'Realiza una consulta por cada día del rango y consolida los resultados en un solo listado. ' +
        'Útil para análisis históricos o reportes de períodos específicos. ' +
        'IMPORTANTE: cada día consume una solicitud del cupo diario (10.000 requests/ticket). ' +
        'Para rangos grandes se recomienda horario nocturno (22:00–07:00 hrs Chile).',
      inputSchema: {
        ticket: TICKET_SCHEMA,
        fechaInicio: z
          .string()
          .describe(
            'Fecha de inicio del rango en formato ddmmaaaa (ej: 01042026).',
          ),
        fechaFin: z
          .string()
          .describe(
            'Fecha de fin del rango en formato ddmmaaaa (ej: 07042026). Máximo 30 días desde fechaInicio.',
          ),
        estado: z
          .string()
          .optional()
          .describe(
            'Filtro de estado: activas | publicada | cerrada | desierta | adjudicada | revocada | suspendida | todos.',
          ),
        codigoOrganismo: CODIGO_ORGANISMO_SCHEMA,
        codigoProveedor: CODIGO_PROVEEDOR_SCHEMA,
      },
    },
    async ({
      ticket,
      fechaInicio,
      fechaFin,
      estado,
      codigoOrganismo,
      codigoProveedor,
    }) => {
      const resolvedTicket = resolveTicket(ticket);
      const data = await service.getLicitacionesRango(
        resolvedTicket,
        fechaInicio,
        fechaFin,
        estado,
        codigoOrganismo,
        codigoProveedor,
      );
      return {
        content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
      };
    },
  );
}
