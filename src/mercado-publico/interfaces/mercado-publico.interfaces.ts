export interface LicitacionesParams {
  ticket: string;
  fecha?: string; // ddmmaaaa — ej: 07042026
  estado?: string; // activas | publicada | cerrada | desierta | adjudicada | revocada | suspendida | todos
  codigoProveedor?: string;
  codigoOrganismo?: string;
  nombreOrganismo?: string; // nombre o parte del nombre — se resuelve internamente a codigoOrganismo
}

export interface OrdenesDeCompraParams {
  ticket: string;
  fecha?: string; // ddmmaaaa — ej: 07042026
  estado?: string; // enviadaproveedor | aceptada | cancelada | recepcionconforme | pendienterecepcion | todos
  codigoProveedor?: string;
  codigoOrganismo?: string;
  nombreOrganismo?: string; // nombre o parte del nombre — se resuelve internamente a codigoOrganismo
}

export interface MpQueryParams extends Record<string, string> {
  ticket: string;
}
