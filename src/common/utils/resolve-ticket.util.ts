const ENV_VAR = 'MERCADO_PUBLICO_TICKET';

/**
 * Resuelve el ticket de acceso a la API de Mercado Público.
 * Prioridad: parámetro de la tool → variable de entorno MERCADO_PUBLICO_TICKET.
 *
 * @throws {Error} si no se encontró ticket en ninguna fuente.
 */
export function resolveTicket(paramTicket?: string): string {
  const ticket = paramTicket ?? process.env[ENV_VAR];

  if (!ticket) {
    throw new Error(
      `Ticket de Mercado Público no encontrado. ` +
        `Proporciona el parámetro "ticket" en la llamada a la herramienta ` +
        `o define la variable de entorno ${ENV_VAR} en la configuración del servidor MCP.`,
    );
  }

  return ticket;
}
