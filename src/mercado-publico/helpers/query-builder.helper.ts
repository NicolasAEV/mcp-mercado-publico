import type {
  LicitacionesParams,
  OrdenesDeCompraParams,
  MpQueryParams,
} from '../interfaces/mercado-publico.interfaces.js';

/**
 * Construye el objeto de parámetros GET para el endpoint de licitaciones.
 * Solo incluye las keys que tienen valor definido.
 */
export function buildLicitacionesQuery(
  params: LicitacionesParams,
): MpQueryParams {
  const query: MpQueryParams = { ticket: params.ticket };
  if (params.fecha) query.fecha = params.fecha;
  if (params.estado) query.estado = params.estado;
  if (params.codigoProveedor) query.CodigoProveedor = params.codigoProveedor;
  if (params.codigoOrganismo) query.CodigoOrganismo = params.codigoOrganismo;
  return query;
}

/**
 * Construye el objeto de parámetros GET para el endpoint de órdenes de compra.
 * Solo incluye las keys que tienen valor definido.
 */
export function buildOrdenesDeCompraQuery(
  params: OrdenesDeCompraParams,
): MpQueryParams {
  const query: MpQueryParams = { ticket: params.ticket };
  if (params.fecha) query.fecha = params.fecha;
  if (params.estado) query.estado = params.estado;
  if (params.codigoProveedor) query.CodigoProveedor = params.codigoProveedor;
  if (params.codigoOrganismo) query.CodigoOrganismo = params.codigoOrganismo;
  return query;
}
