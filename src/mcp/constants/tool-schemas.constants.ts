import { z } from 'zod';

/**
 * Ticket opcional: si se configuró MERCADO_PUBLICO_TICKET en el entorno del servidor,
 * no es necesario pasarlo en cada llamada a la herramienta.
 */
export const TICKET_SCHEMA = z
  .string()
  .optional()
  .describe(
    'Tu ticket de acceso a la API de Mercado Público. ' +
      'Puedes obtenerlo en https://api.mercadopublico.cl/modules/IniciarSesion.aspx. ' +
      'Si el servidor fue configurado con la variable de entorno MERCADO_PUBLICO_TICKET, este parámetro es opcional.',
  );

export const FECHA_SCHEMA = z
  .string()
  .optional()
  .describe(
    'Fecha en formato ddmmaaaa (ej: 07042026 para el 7 de abril de 2026). ' +
      'Si se omite, se usan los registros del día actual.',
  );

export const CODIGO_PROVEEDOR_SCHEMA = z
  .string()
  .optional()
  .describe(
    'Código numérico del proveedor en Mercado Público (ej: 17793). Úsalo junto a "fecha".',
  );

export const CODIGO_ORGANISMO_SCHEMA = z
  .string()
  .optional()
  .describe(
    'Código numérico del organismo público comprador (ej: 6945). Úsalo junto a "fecha".',
  );

export const NOMBRE_ORGANISMO_SCHEMA = z
  .string()
  .optional()
  .describe(
    'Nombre o parte del nombre del organismo comprador (ej: "Alto del Carmen", "Ministerio de Salud"). ' +
      'Se resuelve automáticamente a su código interno. ' +
      'Alternativa a codigoOrganismo cuando no se conoce el código numérico.',
  );
