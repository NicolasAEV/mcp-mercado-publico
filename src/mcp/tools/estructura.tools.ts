import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

// ─── Documentación completa por endpoint ──────────────────────────────────────

const DOC_LICITACIONES_LISTADO = {
  endpoint: '/licitaciones.json',
  metodo: 'GET',
  descripcion:
    'Lista licitaciones publicadas en Mercado Público. Sin parámetros retorna las del día actual.',
  parametros: {
    ticket: {
      tipo: 'string',
      requerido: true,
      descripcion: 'Ticket de acceso a la API de Mercado Público',
    },
    fecha: {
      tipo: 'string (ddmmaaaa)',
      requerido: false,
      descripcion:
        'Fecha exacta a consultar. Ej: "07042026" → 7 de abril de 2026',
    },
    estado: {
      tipo: 'string',
      requerido: false,
      valores: [
        'activas — publicadas hoy',
        'publicada → código 5',
        'cerrada → código 6',
        'desierta → código 7',
        'adjudicada → código 8',
        'revocada → código 18',
        'suspendida → código 19',
        'todos — todos los estados',
      ],
    },
    CodigoOrganismo: {
      tipo: 'number',
      requerido: false,
      descripcion:
        'Código numérico del organismo comprador. Obtenible con BuscarComprador.',
    },
    CodigoProveedor: {
      tipo: 'number',
      requerido: false,
      descripcion:
        'Código numérico del proveedor. Obtenible con BuscarProveedor.',
    },
    codigo: {
      tipo: 'string',
      requerido: false,
      descripcion:
        'Código único de licitación para obtener detalle completo. Ej: "1509-5-L114". Cuando se pasa este parámetro, los demás son ignorados.',
    },
  },
  respuesta_listado: {
    Cantidad: 'number — Total de licitaciones en el listado',
    FechaCreacion: 'string (ISO 8601) — Fecha y hora de la consulta',
    Version: 'string — Versión de la API (ej: "v1.0.0")',
    Listado: [
      {
        CodigoLicitacion: 'string — Código único (ej: "1509-5-L114")',
        Nombre: 'string — Título de la licitación',
        CodigoEstado:
          'number — 5=Publicada, 6=Cerrada, 7=Desierta, 8=Adjudicada, 18=Revocada, 19=Suspendida',
        DescripcionEstado: 'string — Nombre del estado en texto',
        Tipo: 'string — Tipo de licitación: L1, LE, LP, LS, A1, B1, J1, F1, E1, CO, B2, A2, D1, E2, C2, C1, F2, F3, G2, G1, R1, CA, SE',
        FechaCreacion: 'string (ISO 8601)',
        FechaCierre: 'string (ISO 8601) — Fecha límite de recepción de ofertas',
        FechaPublicacion: 'string (ISO 8601)',
        CodigoOrganismo: 'number',
        NombreOrganismo: 'string',
        CodigoUnidad: 'number',
        NombreUnidad: 'string',
        MontoEstimado: 'number',
        Moneda: 'string — CLP | CLF | USD | UTM | EUR',
      },
    ],
  },
  respuesta_detalle: {
    _nota:
      'Al consultar con ?codigo=XXXX se retornan todos los campos del listado MÁS:',
    Descripcion: 'string — Descripción detallada',
    TipoMontoEstimado:
      'number — 1=Presupuesto Disponible, 2=Precio Referencial',
    Informada: 'number — 1=Sí, 0=No',
    CodigoTipo: 'number — 1=Pública, 2=Privada',
    TomaRazon: 'number — 1=Requiere toma de razón Contraloría, 0=No',
    Contrato: 'string — "SI" | "NO"',
    Obras: 'number — 2=Obra pública, 1=No',
    VisibilidadMonto: 'number — 1=Visible, 0=No',
    SubContratacion: 'number — 1=Permite, 0=No',
    ExtensionPlazo: 'number — 1=Se extiende automáticamente, 0=No',
    EsBaseTipo: 'number — 1=Creada desde licitación tipo, 0=No',
    EsRenovable: 'number — 1=Sí, 0=No',
    ModalidadPago:
      'number — 1=30días, 2=30-60-90días, 3=AlDía, 4=Anual, 5=60días, 6=Mensual, 7=ContraEntrega, 8=Bimensual, 9=AvanceObra, 10=Trimestral',
    TiempoEvaluacion: 'number',
    UnidadTiempoEvaluacion:
      'number — 1=Horas, 2=Días, 3=Semanas, 4=Meses, 5=Años',
    DuracionContrato: 'number',
    UnidadDuracionContrato:
      'number — 1=Horas, 2=Días, 3=Semanas, 4=Meses, 5=Años',
    Organismos: {
      CodigoOrganismo: 'number',
      NombreOrganismo: 'string',
      CodigoUnidad: 'number',
      NombreUnidad: 'string',
      RutUnidad: 'string',
      DireccionUnidad: 'string',
      ComunaUnidad: 'string',
      RegionUnidad: 'string',
    },
    Contacto: {
      Nombre: 'string',
      Fono: 'string',
      Email: 'string',
    },
    Items: {
      Cantidad: 'number',
      Listado: [
        {
          Correlativo: 'number',
          CodigoCategoria: 'string — Categoría ONU del producto',
          Categoria: 'string',
          Nombre: 'string',
          Descripcion: 'string',
          UnidadMedida: 'string',
          Cantidad: 'number',
          Moneda: 'string',
          MontoUnitario: 'number',
        },
      ],
    },
    Adjudicacion: {
      _nota: 'Solo presente cuando CodigoEstado = 8 (Adjudicada)',
      NumeroOC: 'string — Número de la OC generada',
      Tipo: 'number — 1=Autorización, 2=Resolución, 3=Otros, 4=Decreto, 5=Acuerdo',
      NumeroActo: 'string',
      FechaActo: 'string (ISO 8601)',
      UrlActo: 'string — URL del documento del acto administrativo',
      Oferentes: [
        {
          NombreProveedor: 'string',
          RutProveedor: 'string',
          CodigoProveedor: 'number',
          Monto: 'number',
          Adjudicado: 'string — "SI" | "NO"',
          NroItems: 'number',
        },
      ],
    },
  },
};

const DOC_ORDENES_COMPRA = {
  endpoint: '/ordenesdecompra.json',
  metodo: 'GET',
  descripcion:
    'Lista órdenes de compra emitidas. Sin parámetros retorna las del día actual.',
  parametros: {
    ticket: {
      tipo: 'string',
      requerido: true,
      descripcion: 'Ticket de acceso a la API',
    },
    fecha: {
      tipo: 'string (ddmmaaaa)',
      requerido: false,
      descripcion: 'Fecha exacta a consultar. Ej: "07042026"',
    },
    estado: {
      tipo: 'string',
      requerido: false,
      valores: [
        'enviadaproveedor → código 4',
        'aceptada → código 6',
        'cancelada → código 9',
        'recepcionconforme → código 12',
        'pendienterecepcion → código 13',
        'recepcionaceptadacialmente → código 14',
        'recepecionconformeincompleta → código 15',
        'todos — todos los estados',
      ],
    },
    CodigoOrganismo: {
      tipo: 'number',
      requerido: false,
      descripcion: 'Código numérico del organismo comprador',
    },
    CodigoProveedor: {
      tipo: 'number',
      requerido: false,
      descripcion: 'Código numérico del proveedor',
    },
    codigo: {
      tipo: 'string',
      requerido: false,
      descripcion:
        'Código único de OC para obtener detalle completo. Ej: "2097-241-SE14". Cuando se pasa, los demás parámetros son ignorados.',
    },
  },
  respuesta_listado: {
    Cantidad: 'number',
    FechaCreacion: 'string (ISO 8601)',
    Version: 'string',
    Listado: [
      {
        Codigo: 'string — Código OC (ej: "2097-241-SE14")',
        CodigoEstado:
          'number — 4=EnviadaProveedor, 5=EnProceso, 6=Aceptada, 9=Cancelada, 12=RecepcionConforme, 13=PendienteRecepcion, 14=RecepcionadaParcialmente, 15=RecepcionConformeIncompleta',
        Tipo: 'string — OC | D1 | C1 | F3 | G1 | R1 | CA | SE | CM | FG | TL | MC | AG | CC',
        FechaCreacion: 'string (ISO 8601)',
        FechaEnvio: 'string (ISO 8601)',
        Moneda: 'string — CLP | CLF | USD | UTM | EUR',
        TotalNeto: 'number',
        NombreProveedor: 'string',
        RutProveedor: 'string',
        CodigoProveedor: 'number',
        NombreOrganismo: 'string',
        CodigoOrganismo: 'number',
      },
    ],
  },
  respuesta_detalle: {
    _nota:
      'Al consultar con ?codigo=XXXX se retornan todos los campos del listado MÁS:',
    DescripcionTipo: 'string — Descripción del tipo de OC',
    FechaModificacion: 'string (ISO 8601)',
    IVA: 'number — Porcentaje IVA aplicado',
    Cargos: 'number',
    Descuentos: 'number',
    TotalBruto: 'number',
    TipoDespacho:
      'number — 7=DireccionEnvio, 9=SegunPrograma, 12=OtraForma, 14=RetirosBodega, 20=CourierAereo, 21=CourierTerrestre, 22=AConvenir',
    FormaPago:
      'number — 1=15días, 2=30días, 39=OtraForma, 46=50días, 47=60días, 48=45días, 49=MasDe30días',
    CodigoLicitacion: 'string — Licitación de origen (si aplica)',
    Proveedor: {
      Codigo: 'number',
      Nombre: 'string',
      Rut: 'string',
      Direccion: 'string',
      Ciudad: 'string',
      Email: 'string',
      Fono: 'string',
    },
    Comprador: {
      CodigoOrganismo: 'number',
      NombreOrganismo: 'string',
      CodigoUnidad: 'number',
      NombreUnidad: 'string',
      RutUnidad: 'string',
      Direccion: 'string',
      Ciudad: 'string',
      Nombre: 'string — Nombre del funcionario comprador',
      Email: 'string',
    },
    Items: [
      {
        Correlativo: 'number',
        CodigoProducto: 'string — Código ONU del producto',
        NombreProducto: 'string',
        Descripcion: 'string',
        Cantidad: 'number',
        UnidadMedida: 'string',
        PrecioUnitario: 'number',
        PrecioNeto: 'number',
      },
    ],
  },
};

const DOC_BUSCAR_PROVEEDOR = {
  endpoint: '/BuscarProveedor.json',
  metodo: 'GET',
  descripcion: 'Busca un proveedor registrado en Mercado Público por su RUT.',
  parametros: {
    ticket: {
      tipo: 'string',
      requerido: true,
      descripcion: 'Ticket de acceso a la API',
    },
    rutempresaproveedor: {
      tipo: 'string',
      requerido: true,
      descripcion: 'RUT de la empresa proveedora. Ej: "70.017.820-k"',
    },
  },
  respuesta: {
    CodigoEmpresa:
      'number — Código numérico interno (usar como CodigoProveedor en búsquedas)',
    NombreEmpresa: 'string — Razón social de la empresa',
    RutEmpresa: 'string — RUT con formato',
    CodigoEstadoRegistro: 'string — Estado en registro de proveedores',
  },
};

const DOC_BUSCAR_COMPRADOR = {
  endpoint: '/BuscarComprador.json',
  metodo: 'GET',
  descripcion:
    'Retorna el listado completo de organismos públicos (municipios, ministerios, servicios, etc.) registrados como compradores en Mercado Público.',
  parametros: {
    ticket: {
      tipo: 'string',
      requerido: true,
      descripcion: 'Ticket de acceso a la API',
    },
  },
  respuesta: {
    listaEmpresas: [
      {
        CodigoEmpresa:
          'number — Código numérico del organismo (usar como CodigoOrganismo en búsquedas)',
        NombreEmpresa: 'string — Nombre del organismo público',
        RutEmpresa: 'string — RUT del organismo',
        CodigoEstadoRegistro: 'string — Estado en el registro',
      },
    ],
  },
  notas: [
    'La respuesta incluye TODOS los organismos sin filtro. Para buscar por nombre, filtrar localmente.',
    'El campo CodigoEmpresa equivale a CodigoOrganismo en los endpoints de licitaciones y OC.',
  ],
};

const LIMITACION_ARCHIVOS = {
  importante:
    'Este MCP NO tiene acceso a los archivos adjuntos de las licitaciones ni de las órdenes de compra ' +
    '(bases, anexos, especificaciones técnicas, resoluciones, etc.). ' +
    'La API de Mercado Público no retorna links de descarga ni el contenido de los documentos. ' +
    'Para acceder a los archivos, debes ingresar directamente al portal: https://www.mercadopublico.cl',
};

const DOC_TODOS = {
  resumen_endpoints: [
    {
      endpoint: '/licitaciones.json',
      tool_mcp:
        'buscar_licitaciones / obtener_licitacion / buscar_licitaciones_rango',
      descripcion: 'Licitaciones por fecha, estado, organismo o proveedor',
    },
    {
      endpoint: '/ordenesdecompra.json',
      tool_mcp: 'buscar_ordenes_de_compra / obtener_orden_de_compra',
      descripcion: 'Órdenes de compra por fecha, estado, organismo o proveedor',
    },
    {
      endpoint: '/BuscarProveedor.json',
      tool_mcp: 'buscar_proveedor',
      descripcion: 'Datos de un proveedor por RUT',
    },
    {
      endpoint: '/BuscarComprador.json',
      tool_mcp: 'listar_compradores / buscar_organismo',
      descripcion: 'Listado completo de organismos públicos compradores',
    },
  ],
  nota: 'Para ver parámetros y respuesta completa de cada endpoint, consulta con tipo = licitaciones | ordenes_de_compra | buscar_proveedor | buscar_comprador',
};

// ─── Índice ───────────────────────────────────────────────────────────────────

const DOCS: Record<string, unknown> = {
  licitaciones: {
    ...DOC_LICITACIONES_LISTADO,
    limitacion_archivos: LIMITACION_ARCHIVOS,
  },
  ordenes_de_compra: {
    ...DOC_ORDENES_COMPRA,
    limitacion_archivos: LIMITACION_ARCHIVOS,
  },
  buscar_proveedor: DOC_BUSCAR_PROVEEDOR,
  buscar_comprador: DOC_BUSCAR_COMPRADOR,
  todos: { ...DOC_TODOS, limitacion_archivos: LIMITACION_ARCHIVOS },
};

// ─── Tool ─────────────────────────────────────────────────────────────────────

export function registerEstructuraTools(server: McpServer): void {
  server.registerTool(
    'estructura',
    {
      title: 'Documentación de Endpoints de la API',
      description:
        'Referencia completa de cada endpoint de la API de Mercado Público: parámetros de entrada, tipos, valores válidos y estructura de la respuesta JSON. ' +
        'Usar antes de construir una integración o cuando se necesita saber qué campos retorna un endpoint. ' +
        'Tipos disponibles: ' +
        'licitaciones (endpoint /licitaciones.json — parámetros + respuesta listado + respuesta detalle), ' +
        'ordenes_de_compra (endpoint /ordenesdecompra.json — parámetros + respuesta listado + respuesta detalle), ' +
        'buscar_proveedor (endpoint BuscarProveedor.json — parámetros + respuesta), ' +
        'buscar_comprador (endpoint BuscarComprador.json — parámetros + respuesta), ' +
        'todos (resumen general de todos los endpoints con su tool MCP correspondiente).',
      inputSchema: {
        tipo: z
          .enum([
            'licitaciones',
            'ordenes_de_compra',
            'buscar_proveedor',
            'buscar_comprador',
            'todos',
          ])
          .describe(
            'Endpoint a documentar:\n' +
              '  - licitaciones       → /licitaciones.json (parámetros + respuesta listado + detalle)\n' +
              '  - ordenes_de_compra  → /ordenesdecompra.json (parámetros + respuesta listado + detalle)\n' +
              '  - buscar_proveedor   → /BuscarProveedor.json (parámetros + respuesta)\n' +
              '  - buscar_comprador   → /BuscarComprador.json (parámetros + respuesta)\n' +
              '  - todos              → resumen general de todos los endpoints',
          ),
      },
    },
    ({ tipo }) => {
      const doc = DOCS[tipo];
      return {
        content: [{ type: 'text', text: JSON.stringify(doc, null, 2) }],
      };
    },
  );
}
