import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

// ─── Estructuras de respuesta documentadas ────────────────────────────────────

const ESTRUCTURA_LICITACION_LISTADO = {
  _descripcion:
    'Respuesta del endpoint /licitaciones.json al listar (sin código específico)',
  Cantidad: 'number — Total de licitaciones en el listado',
  FechaCreacion: 'string (ISO 8601) — Fecha y hora de la consulta',
  Version: 'string — Versión de la API (ej: "v1.0.0")',
  Listado: [
    {
      CodigoLicitacion: 'string — Código único (ej: "1509-5-L114")',
      Nombre: 'string — Nombre/título de la licitación',
      CodigoEstado:
        'number — 5=Publicada, 6=Cerrada, 7=Desierta, 8=Adjudicada, 18=Revocada, 19=Suspendida',
      DescripcionEstado: 'string — Nombre del estado en texto',
      Tipo: 'string — Tipo de licitación (L1, LE, LP, LS, A1, B1, etc.)',
      FechaCreacion: 'string (ISO 8601) — Fecha de creación',
      FechaCierre: 'string (ISO 8601) — Fecha límite de recepción de ofertas',
      FechaPublicacion: 'string (ISO 8601) — Fecha de publicación',
      CodigoOrganismo: 'number — Código numérico del organismo comprador',
      NombreOrganismo: 'string — Nombre del organismo comprador',
      CodigoUnidad: 'number — Código de la unidad compradora',
      NombreUnidad: 'string — Nombre de la unidad compradora',
      MontoEstimado: 'number — Monto estimado del contrato',
      Moneda: 'string — CLP | CLF | USD | UTM | EUR',
    },
  ],
};

const ESTRUCTURA_LICITACION_DETALLE = {
  _descripcion:
    'Respuesta del endpoint /licitaciones.json?codigo=XXXX (detalle completo)',
  Cantidad: 'number — Siempre 1 cuando se consulta por código',
  FechaCreacion: 'string (ISO 8601)',
  Version: 'string',
  Listado: [
    {
      _nota:
        'Contiene todos los campos del listado MÁS los siguientes campos adicionales',
      CodigoLicitacion: 'string',
      Nombre: 'string',
      CodigoEstado: 'number',
      Tipo: 'string — Código tipo licitación (L1, LE, LP, LS, A1, B1, J1, F1, E1, CO, B2, A2, D1, E2, C2, C1, F2, F3, G2, G1, R1, CA, SE)',
      Descripcion: 'string — Descripción detallada',
      Moneda: 'string — CLP | CLF | USD | UTM | EUR',
      MontoEstimado: 'number',
      TipoMontoEstimado:
        'number — 1=Presupuesto Disponible, 2=Precio Referencial',
      Informada: 'number — 1=Si, 0=No (licitación informada)',
      CodigoTipo: 'number — 1=Pública, 2=Privada',
      TomaRazon: 'number — 1=Requiere toma de razón Contraloría, 0=No',
      Contrato: 'string — "SI" | "NO"',
      Obras: 'number — 2=Obra pública, 1=No',
      VisibilidadMonto: 'number — 1=Monto visible, 0=No',
      SubContratacion: 'number — 1=Permite, 0=No permite',
      ExtensionPlazo: 'number — 1=Se extiende automáticamente, 0=No',
      EsBaseTipo: 'number — 1=Creada desde licitación tipo, 0=No',
      EsRenovable: 'number — 1=Sí, 0=No',
      ModalidadPago:
        'number — 1=30días, 2=30-60-90días, 3=AlDía, 4=Anual, 5=60días, 6=Mensual, 7=ContraEntrega, 8=Bimensual, 9=AvanceObra, 10=Trimestral',
      TiempoEvaluacion: 'number — Cantidad de tiempo para evaluación',
      UnidadTiempoEvaluacion:
        'number — 1=Horas, 2=Días, 3=Semanas, 4=Meses, 5=Años',
      DuracionContrato: 'number — Duración del contrato',
      UnidadDuracionContrato:
        'number — 1=Horas, 2=Días, 3=Semanas, 4=Meses, 5=Años',
      Organismos: {
        _descripcion: 'Datos del organismo comprador',
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
        _descripcion: 'Persona de contacto para la licitación',
        Nombre: 'string',
        Fono: 'string',
        Email: 'string',
      },
      Items: {
        _descripcion: 'Ítems/productos de la licitación',
        Cantidad: 'number',
        Listado: [
          {
            Correlativo: 'number',
            CodigoCategoria: 'string — Categoría ONU del producto',
            Categoria: 'string — Nombre de la categoría',
            Nombre: 'string — Nombre del ítem',
            Descripcion: 'string',
            UnidadMedida: 'string',
            Cantidad: 'number',
            Moneda: 'string',
            MontoUnitario: 'number',
          },
        ],
      },
      Adjudicacion: {
        _descripcion: 'Datos de adjudicación (solo si CodigoEstado = 8)',
        NumeroOC: 'string — Número de la orden de compra generada',
        Tipo: 'number — Tipo de acto administrativo (1=Autorización, 2=Resolución, 3=Otros, 4=Decreto, 5=Acuerdo)',
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
  ],
};

const ESTRUCTURA_ORDEN_COMPRA_LISTADO = {
  _descripcion: 'Respuesta del endpoint /ordenesdecompra.json al listar',
  Cantidad: 'number — Total de OC en el listado',
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
};

const ESTRUCTURA_ORDEN_COMPRA_DETALLE = {
  _descripcion:
    'Respuesta del endpoint /ordenesdecompra.json?codigo=XXXX (detalle completo)',
  Cantidad: 'number — Siempre 1',
  FechaCreacion: 'string (ISO 8601)',
  Version: 'string',
  Listado: [
    {
      Codigo: 'string',
      CodigoEstado: 'number',
      Tipo: 'string — Abreviación del tipo de OC',
      DescripcionTipo: 'string — Descripción del tipo',
      FechaCreacion: 'string (ISO 8601)',
      FechaEnvio: 'string (ISO 8601)',
      FechaModificacion: 'string (ISO 8601)',
      Moneda: 'string',
      TotalNeto: 'number',
      IVA: 'number — Porcentaje IVA aplicado',
      Cargos: 'number',
      Descuentos: 'number',
      TotalBruto: 'number',
      TipoDespacho:
        'number — 7=DireccionEnvio, 9=SegunPrograma, 12=OtraForma, 14=RetirosBodega, 20=CourierAereo, 21=CourierTerrestre, 22=AConvenir',
      FormaPago:
        'number — 2=30días, 1=15días, 39=OtraForma, 46=50días, 47=60días, 48=45días, 49=MasDe30días',
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
  ],
};

const ESTRUCTURA_PROVEEDOR = {
  _descripcion: 'Respuesta del endpoint BuscarProveedor',
  CodigoEmpresa:
    'number — Código numérico interno (usar como CodigoProveedor en búsquedas)',
  NombreEmpresa: 'string — Razón social de la empresa',
  RutEmpresa: 'string — RUT con formato',
  CodigoEstadoRegistro: 'string — Estado en registro de proveedores',
};

const ESTRUCTURA_ORGANISMO = {
  _descripcion: 'Elemento del listado retornado por BuscarComprador',
  CodigoOrganismo:
    'number — Código numérico (usar como CodigoOrganismo en búsquedas)',
  NombreOrganismo: 'string — Nombre del organismo público',
  _uso: 'Pasar CodigoOrganismo a buscar_licitaciones o buscar_ordenes_de_compra',
};

const ESTRUCTURAS: Record<string, unknown> = {
  licitacion_listado: ESTRUCTURA_LICITACION_LISTADO,
  licitacion_detalle: ESTRUCTURA_LICITACION_DETALLE,
  orden_compra_listado: ESTRUCTURA_ORDEN_COMPRA_LISTADO,
  orden_compra_detalle: ESTRUCTURA_ORDEN_COMPRA_DETALLE,
  proveedor: ESTRUCTURA_PROVEEDOR,
  organismo: ESTRUCTURA_ORGANISMO,
};

// ─── Tool ─────────────────────────────────────────────────────────────────────

export function registerEstructuraTools(server: McpServer): void {
  server.registerTool(
    'estructura',
    {
      title: 'Estructura de Respuesta de la API',
      description:
        'Devuelve el esquema documentado de la respuesta JSON de cada endpoint de Mercado Público. ' +
        'Útil para developers que construyen aplicaciones y necesitan conocer los campos disponibles. ' +
        'Tipos disponibles: ' +
        'licitacion_listado (resultado de buscar_licitaciones), ' +
        'licitacion_detalle (resultado de obtener_licitacion por código), ' +
        'orden_compra_listado (resultado de buscar_ordenes_de_compra), ' +
        'orden_compra_detalle (resultado de obtener_orden_de_compra por código), ' +
        'proveedor (resultado de buscar_proveedor), ' +
        'organismo (elemento de listar_compradores o buscar_organismo).',
      inputSchema: {
        tipo: z
          .enum([
            'licitacion_listado',
            'licitacion_detalle',
            'orden_compra_listado',
            'orden_compra_detalle',
            'proveedor',
            'organismo',
          ])
          .describe(
            'Tipo de estructura a consultar:\n' +
              '  - licitacion_listado     → campos de buscar_licitaciones\n' +
              '  - licitacion_detalle     → campos de obtener_licitacion (por código)\n' +
              '  - orden_compra_listado   → campos de buscar_ordenes_de_compra\n' +
              '  - orden_compra_detalle   → campos de obtener_orden_de_compra (por código)\n' +
              '  - proveedor              → campos de buscar_proveedor\n' +
              '  - organismo              → campos de listar_compradores / buscar_organismo',
          ),
      },
    },
    ({ tipo }) => {
      const estructura = ESTRUCTURAS[tipo];
      return {
        content: [{ type: 'text', text: JSON.stringify(estructura, null, 2) }],
      };
    },
  );
}
