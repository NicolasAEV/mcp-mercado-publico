export const MP_BASE_URL = 'https://api.mercadopublico.cl/servicios/v1';

export const MP_ENDPOINTS = {
  licitaciones: '/publico/licitaciones.json',
  ordenesDeCompra: '/publico/ordenesdecompra.json',
  buscarProveedor: '/Publico/Empresas/BuscarProveedor',
  buscarComprador: '/Publico/Empresas/BuscarComprador',
} as const;

export const LICITACION_ESTADOS = {
  publicada: '5',
  cerrada: '6',
  desierta: '7',
  adjudicada: '8',
  revocada: '18',
  suspendida: '19',
} as const;

/**
 * Códigos de estado que aparecen en la RESPUESTA de la API.
 * El estado "enProceso" (5) NO tiene nombre de texto para usar como query param GET.
 * Los demás estados sí tienen nombre de texto para filtrar (ver ORDEN_COMPRA_ESTADOS_QUERY).
 */
export const ORDEN_COMPRA_ESTADOS = {
  enviadaProveedor: '4',
  enProceso: '5', // Solo aparece en respuesta, sin nombre de query param
  aceptada: '6',
  cancelada: '9',
  recepcionConforme: '12',
  pendienteRecepcion: '13',
  recepcionadaParcialmente: '14',
  recepcionConformeIncompleta: '15',
} as const;

/**
 * Nombres de texto válidos para el parámetro ?estado= en órdenes de compra.
 * Fuente: ordenes-compra.md
 */
export const ORDEN_COMPRA_ESTADOS_QUERY = [
  'enviadaproveedor',
  'aceptada',
  'cancelada',
  'recepcionconforme',
  'pendienterecepcion',
  'recepcionaceptadacialmente', // Recepcionada Parcialmente
  'recepecionconformeincompleta', // Recepción Conforme Incompleta
  'todos',
] as const;
