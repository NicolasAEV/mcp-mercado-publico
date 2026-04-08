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

export function registerOrdenesDeCompraTools(
  server: McpServer,
  service: MercadoPublicoService,
): void {
  server.registerTool(
    'buscar_ordenes_de_compra',
    {
      title: 'Buscar Órdenes de Compra',
      description:
        'Busca órdenes de compra en Mercado Público (ChileCompra). ' +
        'Sin parámetros opcionales retorna todas las OC del día actual. ' +
        'Puedes filtrar por fecha, estado, proveedor u organismo. ' +
        'Para buscar por organismo usa nombreOrganismo (nombre o parte) o codigoOrganismo (código numérico). ' +
        'Sin fecha y con organismo/proveedor, busca automáticamente los últimos 30 días. ' +
        'Valores válidos para el parámetro estado: enviadaproveedor, aceptada, cancelada, recepcionconforme, ' +
        'pendienterecepcion, recepcionaceptadacialmente, recepecionconformeincompleta, todos. ' +
        'NOTA: el estado "en proceso" (código 5) solo aparece en la respuesta, no es filtrable como query param. ' +
        'Códigos en respuesta: EnviadaProveedor=4, EnProceso=5, Aceptada=6, Cancelada=9, ' +
        'RecepcionConforme=12, PendienteRecepcion=13, RecepcionadaParcialmente=14, RecepcionConformeIncompleta=15.',
      inputSchema: {
        ticket: TICKET_SCHEMA,
        fecha: FECHA_SCHEMA,
        estado: z
          .string()
          .optional()
          .describe(
            'Estado de la OC: enviadaproveedor | aceptada | cancelada | recepcionconforme | ' +
              'pendienterecepcion | recepcionaceptadacialmente | recepecionconformeincompleta | todos.',
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
      const data = await service.getOrdenesDeCompra({
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
    'obtener_orden_de_compra',
    {
      title: 'Obtener Orden de Compra por Código',
      description:
        'Obtiene el detalle completo de una orden de compra por su código único. ' +
        'Formato del código: XXXX-XXX-XXXXX (ej: 2097-241-SE14). ' +
        'Retorna ítems, montos, proveedor, organismo comprador y estado.',
      inputSchema: {
        ticket: TICKET_SCHEMA,
        codigo: z
          .string()
          .describe(
            'Código único de la OC. Formato: XXXX-XXX-XXXXX (ej: 2097-241-SE14).',
          ),
      },
    },
    async ({ ticket, codigo }) => {
      const resolvedTicket = resolveTicket(ticket);
      const data = await service.getOrdenDeCompraPorCodigo(
        resolvedTicket,
        codigo,
      );
      return {
        content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
      };
    },
  );
}
