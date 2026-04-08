import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

// ─── LIMITACIONES GENERALES ───────────────────────────────────────────────────

const LIMITACION_ARCHIVOS = {
  importante:
    'Este MCP NO tiene acceso a los archivos adjuntos de las licitaciones ni de las órdenes de compra ' +
    '(bases, anexos, especificaciones técnicas, resoluciones, etc.). ' +
    'La API de Mercado Público no retorna links de descarga ni el contenido de los documentos. ' +
    'Para acceder a los archivos, debes ingresar directamente al portal.',
};

// ==============================================================================
// 1. ESTRUCTURAS JSON (RESPUESTAS)
// ==============================================================================

const LICITACIONES_ESTRUCTURA = {
  endpoint: '/licitaciones.json',
  respuesta_listado: {
    Cantidad: 'number',
    FechaCreacion: 'string (ISO)',
    Version: 'string',
    Listado: [
      {
        CodigoExterno: 'string',
        Nombre: 'string',
        CodigoEstado: 'number',
        FechaCierre: 'string',
      },
    ],
  },
  respuesta_detalle: {
    _nota: 'Al consultar por código se retornan todos los detalles:',
    CodigoExterno: 'string',
    Nombre: 'string',
    CodigoEstado: 'number',
    Descripcion: 'string',
    FechaCierre: 'string',
    Estado: 'string',
    Comprador: 'Objeto con CodigoOrganismo, NombreOrganismo, RutUnidad, DireccionUnidad, RegionUnidad, etc.',
    DiasCierreLicitacion: 'string',
    Informada: 'number',
    CodigoTipo: 'number',
    Tipo: 'string',
    Moneda: 'string',
    Fechas: 'Objeto con FechaCreacion, FechaCierre, FechaPublicacion, FechaAdjudicacion, etc.',
    MontoEstimado: 'number',
    JustificacionMontoEstimado: 'string',
    Tiempo: 'string',
    Modalidad: 'number',
    TipoPago: 'string',
    SubContratacion: 'string',
    Renovable: 'number',
    Items: 'Objeto {"Cantidad": number, "Listado": [{Correlativo, CodigoProducto, Categoria, NombreProducto, Descripcion, UnidadMedida, Cantidad, Adjudicacion}]}',
    Adjudicacion: 'Objeto con Oferentes y detalles del acta o nulo',
  },
  limitacion_archivos: LIMITACION_ARCHIVOS,
};

const ORDENES_ESTRUCTURA = {
  endpoint: '/ordenesdecompra.json',
  respuesta_listado: {
    Cantidad: 'number',
    FechaCreacion: 'string (ISO)',
    Version: 'string',
    Listado: [
      {
        Codigo: 'string',
        Nombre: 'string',
        CodigoEstado: 'number',
      },
    ],
  },
  respuesta_detalle: {
    _nota: 'Actualmente al buscar por código se obtienen estos detalles extendidos:',
    DescripcionTipo: 'string',
    FechaModificacion: 'string',
    IVA: 'number',
    Cargos: 'number',
    Descuentos: 'number',
    TotalNeto: 'number',
    TotalBruto: 'number',
    TipoDespacho: 'number',
    FormaPago: 'number',
    CodigoLicitacion: 'string',
    Moneda: 'string',
    Proveedor: 'Objeto completo del proveedor (Rut, RazonSocial, etc.)',
    Comprador: 'Objeto completo del comprador',
    Items: 'Arreglo con el detalle de items de la orden',
  },
  limitacion_archivos: LIMITACION_ARCHIVOS,
};

const PROVEEDORES_ESTRUCTURA = {
  endpoint: '/BuscarProveedor.json',
  respuesta: {
    CodigoEmpresa: 'number',
    NombreEmpresa: 'string',
    RutEmpresa: 'string',
    CodigoEstadoRegistro: 'string',
  },
};

const COMPRADORES_ESTRUCTURA = {
  endpoint: '/BuscarComprador.json',
  respuesta: {
    listaEmpresas: [
      {
        CodigoEmpresa: 'number',
        NombreEmpresa: 'string',
        RutEmpresa: 'string',
        CodigoEstadoRegistro: 'string',
      },
    ],
  },
};

// ==============================================================================
// 2. CONSULTAS, PARÁMETROS y ANEXOS
// ==============================================================================

const LICITACIONES_CONSULTAS = {
  endpoint: '/licitaciones.json',
  metodo: 'GET',
  parametros_aceptados: {
    ticket: 'string (requerido)',
    fecha: 'string (ddmmaaaa)',
    estado: 'string (activas, publicada, cerrada, desierta, adjudicada, revocada, suspendida, todos)',
    CodigoOrganismo: 'number',
    CodigoProveedor: 'number',
    codigo: 'string (ej: 1509-5-L114. Al usarse ignora el resto de parámetros.)',
  },
  anexos: {
    estados: { Publicada: '5', Cerrada: '6', Desierta: '7', Adjudicada: '8', Revocada: '18', Suspendida: '19' },
    tipo_licitacion: {
      L1: 'Licitación Pública Menor a 100 UTM',
      LE: 'Licitación Pública Entre 100 y 1000 UTM',
      LP: 'Licitación Pública Mayor 1000 UTM',
      LS: 'Licitación Pública Servicios personales especializados',
      A1: 'Licitación Privada por Licitación Pública anterior sin oferentes',
      B1: 'Licitación Privada por otras causales',
      J1: 'Licitación Privada por Servicios de Naturaleza Confidencial',
      F1: 'Licitación Privada por Convenios con Personas Jurídicas Extranjeras',
      E1: 'Licitación Privada por Remanente de Contrato anterior',
      CO: 'Licitación Privada entre 100 y 1000 UTM',
      B2: 'Licitación Privada Mayor a 1000 UTM',
      A2: 'Trato Directo por Producto de Licitación Privada anterior sin oferentes',
      D1: 'Trato Directo por Proveedor Único',
      E2: 'Licitación Privada Menor a 100 UTM',
      C2: 'Trato Directo (Cotización)',
      C1: 'Compra Directa (Orden de compra)',
      F2: 'Trato Directo (Cotización)',
      F3: 'Compra Directa (Orden de compra)',
      G2: 'Directo (Cotización)',
      G1: 'Compra Directa (Orden de compra)',
      R1: 'Orden de Compra menor a 3 UTM',
      CA: 'Orden de Compra sin Resolución',
      SE: 'Orden de Compra proveniente de adquisición sin emisión automática',
    },
    unidad_monetaria: { CLP: 'Peso Chileno', CLF: 'Unidad de Fomento', USD: 'Dólar Americano', UTM: 'Unidad Tributaria Mensual', EUR: 'Euro' },
    monto_estimado: { '1': 'Presupuesto Disponible', '2': 'Precio Referencial' },
    modalidad_pago: {
      '1': 'Pago a 30 días', '2': 'Pago a 30, 60 y 90 días', '3': 'Pago al día', '4': 'Pago Anual', '5': 'Pago a 60 días',
      '6': 'Pagos Mensuales', '7': 'Pago Contra Entrega Conforme', '8': 'Pago Bimensual', '9': 'Pago Por Estado de Avance', '10': 'Pago Trimestral',
    },
    unidad_tiempo: { '1': 'Horas', '2': 'Días', '3': 'Semanas', '4': 'Meses', '5': 'Años' },
    tipo_acto_administrativo: { '1': 'Autorización', '2': 'Resolución', '3': 'Otros', '4': 'Decreto', '5': 'Acuerdo' },
  }
};

const ORDENES_CONSULTAS = {
  endpoint: '/ordenesdecompra.json',
  metodo: 'GET',
  parametros_aceptados: {
    ticket: 'string (requerido)',
    fecha: 'string (ddmmaaaa)',
    estado: 'string (enviadaproveedor, aceptada, cancelada, recepcionconforme, pendienterecepcion, recepcionaceptadacialmente, recepecionconformeincompleta, todos)',
    CodigoOrganismo: 'number',
    CodigoProveedor: 'number',
    codigo: 'string (ej: 2097-241-SE14. Al usarse ignora el resto de parámetros.)',
  },
  anexos: {
    estados_nomenclatura: {
      'Enviada a Proveedor': 'enviadaproveedor (código 4)',
      'Aceptada': 'aceptada (código 6)',
      'Cancelada': 'cancelada (código 9)',
      'Recepción Conforme': 'recepcionconforme (código 12)',
      'Pendiente de Recepcionar': 'pendienterecepcion (código 13)',
      'Recepcionada Parcialmente': 'recepcionaceptadacialmente (código 14)',
      'Recepcion Conforme Incompleta': 'recepecionconformeincompleta (código 15)',
      'todos': 'todos'
    },
    tipo_orden_compra: {
      '1': 'OC - Automática', '2': 'D1 - Trato directo', '3': 'C1 - Emergencia e imprevisto', '4': 'F3 - Confidencialidad', '5': 'G1 - Naturaleza de negociación',
      '6': 'R1 - Menor a 3UTM', '7': 'CA - Sin resolución', '8': 'SE - Sin emisión automática', '9': 'CM - Convenio Marco', '10': 'FG - Trato Directo (Art. 8)',
      '11': 'TL - Convenio Marco - Tienda de Libros', '12': 'MC - Microcompra', '13': 'AG - Compra Ágil', '14': 'CC - Compra Coordinada'
    },
    tipo_despacho: {
      '7': 'Despachar a Dirección de envío', '9': 'Despachar según programa adjuntado', '12': 'Otra Forma de Despacho', '14': 'Retiramos de su bodega',
      '20': 'Despacho por courier o encomienda aérea', '21': 'Despacho por courier o encomienda terrestre', '22': 'A convenir'
    },
    tipo_pago: {
      '1': '15 días', '2': '30 días', '39': 'Otra forma', '46': '50 días', '47': '60 días', '48': 'A 45 días', '49': 'A más de 30 días'
    }
  }
};

const PROVEEDORES_CONSULTAS = {
  endpoint: '/BuscarProveedor.json',
  metodo: 'GET',
  parametros_aceptados: {
    ticket: 'string (requerido)',
    rutempresaproveedor: 'string (Ej: 70.017.820-k)',
  },
};

const COMPRADORES_CONSULTAS = {
  endpoint: '/BuscarComprador.json',
  metodo: 'GET',
  parametros_aceptados: {
    ticket: 'string (requerido)',
  },
};

// ==============================================================================
// 3. EJEMPLOS Y RUTAS
// ==============================================================================

const LICITACIONES_EJEMPLOS = {
  formatos_soportados: [
    'JSON: /licitaciones.json',
    'JSONP: /licitaciones.jsonp?callback=respuesta',
    'XML: /licitaciones.xml',
  ],
  ejemplos_url: {
    'Por código de licitación': 'https://api.mercadopublico.cl/servicios/v1/publico/licitaciones.json?codigo=1509-5-L114&ticket={{TICKET}}',
    'Por todos los estados del día actual': 'https://api.mercadopublico.cl/servicios/v1/publico/licitaciones.json?ticket={{TICKET}}',
    'Por todos los estados de una fecha en particular': 'https://api.mercadopublico.cl/servicios/v1/publico/licitaciones.json?fecha=02022014&ticket={{TICKET}}',
    'Por estado activas': 'https://api.mercadopublico.cl/servicios/v1/publico/licitaciones.json?estado=activas&ticket={{TICKET}}',
    'Por estado del día actual': 'https://api.mercadopublico.cl/servicios/v1/publico/licitaciones.json?fecha=02022014&estado=adjudicada&ticket={{TICKET}}',
    'Por código de proveedor': 'https://api.mercadopublico.cl/servicios/v1/publico/licitaciones.json?fecha=02022014&CodigoProveedor=17793&ticket={{TICKET}}',
    'Por código de organismo público': 'https://api.mercadopublico.cl/servicios/v1/publico/licitaciones.json?fecha=02022014&CodigoOrganismo=6945&ticket={{TICKET}}',
  }
};

const ORDENES_EJEMPLOS = {
  formatos_soportados: [
    'JSON: /ordenesdecompra.json',
    'JSONP: /ordenesdecompra.jsonp?callback=respuesta',
    'XML: /ordenesdecompra.xml',
  ],
  ejemplos_url: {
    'Por código de orden de compra': 'https://api.mercadopublico.cl/servicios/v1/publico/ordenesdecompra.json?codigo=2097-241-SE14&ticket={{TICKET}}',
    'Por todos los estados del día actual': 'https://api.mercadopublico.cl/servicios/v1/publico/ordenesdecompra.json?estado=todos&ticket={{TICKET}}',
    'Por todos los estados de una fecha específica': 'https://api.mercadopublico.cl/servicios/v1/publico/ordenesdecompra.json?fecha=02022014&ticket={{TICKET}}',
    'Por estado del día actual': 'https://api.mercadopublico.cl/servicios/v1/publico/ordenesdecompra.json?fecha=02022014&estado=aceptada&ticket={{TICKET}}',
    'Por código de organismo público': 'https://api.mercadopublico.cl/servicios/v1/publico/ordenesdecompra.json?fecha=02022014&CodigoOrganismo=6945&ticket={{TICKET}}',
    'Por código de proveedor': 'https://api.mercadopublico.cl/servicios/v1/publico/ordenesdecompra.json?fecha=02022014&CodigoProveedor=17793&ticket={{TICKET}}',
  }
};

const PROVEEDORES_EJEMPLOS = {
  ejemplos_url: {
    'Por RUT de proveedor': 'https://api.mercadopublico.cl/servicios/v1/Publico/Empresas/BuscarProveedor?rutempresaproveedor=70.017.820-k&ticket={{TICKET}}'
  }
};

const COMPRADORES_EJEMPLOS = {
  ejemplos_url: {
    'Listar todos los organismos públicos': 'https://api.mercadopublico.cl/servicios/v1/Publico/Empresas/BuscarComprador?ticket={{TICKET}}'
  }
};

// ==============================================================================
// REGISTRY AND MAPPINGS
// ==============================================================================

const MAPA_ESTRUCTURAS: Record<string, unknown> = {
  licitaciones: LICITACIONES_ESTRUCTURA,
  ordenes_compra: ORDENES_ESTRUCTURA,
  proveedores: PROVEEDORES_ESTRUCTURA,
  compradores: COMPRADORES_ESTRUCTURA,
};

const MAPA_CONSULTAS: Record<string, unknown> = {
  licitaciones: LICITACIONES_CONSULTAS,
  ordenes_compra: ORDENES_CONSULTAS,
  proveedores: PROVEEDORES_CONSULTAS,
  compradores: COMPRADORES_CONSULTAS,
};

const MAPA_EJEMPLOS: Record<string, unknown> = {
  licitaciones: LICITACIONES_EJEMPLOS,
  ordenes_compra: ORDENES_EJEMPLOS,
  proveedores: PROVEEDORES_EJEMPLOS,
  compradores: COMPRADORES_EJEMPLOS,
};

export function registerEstructuraTools(server: McpServer): void {
  // HERRAMIENTA 1: estructura (SÓLO la pura estructura de respuesta JSON)
  server.registerTool(
    'estructura',
    {
      title: 'Estructura de Respuesta JSON (API Mercado Público)',
      description:
        'Devuelve única y exclusivamente la anatomía del JSON de respuesta que entrega la API (qué campos retornan, sus tipos, y estructura de anidación).',
      inputSchema: {
        entidad: z
          .enum(['licitaciones', 'ordenes_compra', 'proveedores', 'compradores'])
          .describe('Entidad para la cual deseas conocer su estructura de respuesta JSON.'),
      },
    },
    ({ entidad }) => {
      const doc = MAPA_ESTRUCTURAS[entidad];
      return {
        content: [{ type: 'text', text: JSON.stringify(doc, null, 2) }],
      };
    },
  );

  // HERRAMIENTA 2: consultas (Parámetros y anexos)
  server.registerTool(
    'consultas',
    {
      title: 'Consultas y Parámetros (API Mercado Público)',
      description:
        'Devuelve CÓMO realizar las consultas: qué parámetros lógicos se aceptan y los anexos/diccionarios (ej: qué número es "Licitación Pública").',
      inputSchema: {
        entidad: z
          .enum(['licitaciones', 'ordenes_compra', 'proveedores', 'compradores'])
          .describe('Entidad para la cual deseas conocer los parámetros y anexos de consulta.'),
      },
    },
    ({ entidad }) => {
      const doc = MAPA_CONSULTAS[entidad];
      return {
        content: [{ type: 'text', text: JSON.stringify(doc, null, 2) }],
      };
    },
  );

  // HERRAMIENTA 3: ejemplos (Ejemplos de URLs de la API y formatos)
  server.registerTool(
    'ejemplos_url',
    {
      title: 'Ejemplos de URLs (API Mercado Público)',
      description:
        'Muestra ejemplos reales de URLs y rutas soportadas (JSON, XML) con sus combinaciones, para saber cómo se arma exactamente una ruta HTTP hacia la API.',
      inputSchema: {
        entidad: z
          .enum(['licitaciones', 'ordenes_compra', 'proveedores', 'compradores'])
          .describe('Entidad para la cual deseas conocer los ejemplos de llamados y URLs.'),
      },
    },
    ({ entidad }) => {
      const doc = MAPA_EJEMPLOS[entidad];
      return {
        content: [{ type: 'text', text: JSON.stringify(doc, null, 2) }],
      };
    },
  );
}
