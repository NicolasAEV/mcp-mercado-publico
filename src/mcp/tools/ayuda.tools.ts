import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

const AYUDA_CONTENIDO = `
# 🇨🇱 MCP Mercado Público — Guía de uso

Servidor MCP para consultar la API pública de ChileCompra en tiempo real.

---

##  Autenticación

El ticket (API key) puede configurarse de dos formas:

1. **Variable de entorno (recomendado):** MERCADO_PUBLICO_TICKET="TU-TICKET"
   → No necesitas pasarlo en cada consulta.

2. **Parámetro por llamada:** agrega ticket="TU-TICKET" a cualquier herramienta.

Obtén tu ticket gratis en: https://api.mercadopublico.cl/modules/IniciarSesion.aspx

---

## Herramientas disponibles

### 1. buscar_licitaciones
Lista licitaciones publicadas en Mercado Público.

Parámetros:
  - ticket?        → API key (opcional si hay variable de entorno)
  - fecha?         → Fecha ddmmaaaa (ej: 07042026). Omitir = día actual
  - estado?        → activas | publicada | cerrada | desierta | adjudicada | revocada | suspendida | todos
  - codigoProveedor? → Código numérico del proveedor (ej: 17793)
  - codigoOrganismo? → Código numérico del organismo comprador (ej: 6945)

Ejemplos:
  → Licitaciones activas de hoy:         { estado: "activas" }
  → Licitaciones de una fecha:           { fecha: "07042026" }
  → Licitaciones adjudicadas del mes:    { fecha: "01042026", estado: "adjudicada" }
  → Licitaciones de un organismo:        { fecha: "07042026", codigoOrganismo: "6945" }

---

### 2. obtener_licitacion
Detalle completo de una licitación por su código único.

Parámetros:
  - ticket?  → API key (opcional)
  - codigo   → Código de licitación, formato XXXX-X-XXXXX (ej: 1509-5-L114)

Ejemplo:
  → { codigo: "1509-5-L114" }

---

### 3. buscar_ordenes_de_compra
Lista órdenes de compra en Mercado Público.

Parámetros:
  - ticket?          → API key (opcional)
  - fecha?           → Fecha ddmmaaaa. Omitir = día actual
  - estado?          → enviadaproveedor | aceptada | cancelada | recepcionconforme |
                        pendienterecepcion | recepcionaceptadacialmente |
                        recepecionconformeincompleta | todos
  - codigoProveedor? → Código numérico del proveedor
  - codigoOrganismo? → Código numérico del organismo comprador

Nota: el estado "En Proceso" (código 5) solo aparece en la respuesta, no como filtro.

Ejemplos:
  → Todas las OC del día:     { estado: "todos" }
  → OC aceptadas de una fecha: { fecha: "07042026", estado: "aceptada" }
  → OC de un proveedor:       { fecha: "07042026", codigoProveedor: "17793" }

---

### 4. obtener_orden_de_compra
Detalle completo de una orden de compra por su código único.

Parámetros:
  - ticket?  → API key (opcional)
  - codigo   → Código de OC, formato XXXX-XXX-XXXXX (ej: 2097-241-SE14)

Ejemplo:
  → { codigo: "2097-241-SE14" }

---

### 5. buscar_proveedor
Busca un proveedor por su RUT y obtiene su código numérico interno.

Parámetros:
  - ticket?  → API key (opcional)
  - rut      → RUT con puntos, guión y dígito verificador (ej: 70.017.820-k)

Ejemplo:
  → { rut: "70.017.820-k" }

Retorna: código numérico del proveedor (CodigoProveedor) para usar en otras herramientas.

---

### 6. listar_compradores
Lista todos los organismos públicos (compradores) registrados en Mercado Público.

Parámetros:
  - ticket?  → API key (opcional)

Retorna: nombre y código numérico (CodigoOrganismo) de cada organismo.

---

### 7. buscar_organismo
Busca organismos públicos por nombre o parte del nombre (municipios, ministerios, servicios, etc.).
Filtra localmente la lista completa de compradores — no requiere conocer el código numérico.

Parámetros:
  - ticket?  → API key (opcional)
  - nombre   → Nombre o parte del nombre a buscar (insensible a mayúsculas)

Ejemplos:
  → { nombre: "Alto del Carmen" }
  → { nombre: "Ministerio de Salud" }
  → { nombre: "CONAF" }

Retorna: código numérico (CodigoOrganismo) para usar en buscar_licitaciones y buscar_ordenes_de_compra.

Flujo típico:
  1. buscar_organismo { nombre: "Alto del Carmen" }  → obtén CodigoOrganismo
  2. buscar_licitaciones { codigoOrganismo: "<codigo>", estado: "activas" }

---

### 8. ayuda
Muestra esta guía completa. Sin parámetros.

---

### 9. estructura
Devuelve la estructura de respuesta JSON (los campos exactos que retorna la API) para cada entidad. Ideal para conocer qué data provee el integrador oficial nativo.

Parámetros:
  - entidad  → licitaciones | ordenes_compra | proveedores | compradores

---

### 10. consultas
Devuelve la información de parámetros y anexos (diccionarios explicativos de los campos numéricos) requeridos para consultar en la API nativa. 

Parámetros:
  - entidad  → licitaciones | ordenes_compra | proveedores | compradores

---

### 11. ejemplos_url
Devuelve los ejemplos de rutas y combinaciones URLs (HTTP) directas a los endpoints como referencias.

Parámetros:
  - entidad  → licitaciones | ordenes_compra | proveedores | compradores

---

## Referencia de estados

### Licitaciones (códigos en respuesta)
  5  → Publicada
  6  → Cerrada
  7  → Desierta
  8  → Adjudicada
  18 → Revocada
  19 → Suspendida

### Órdenes de Compra (códigos en respuesta)
  4  → Enviada a Proveedor
  5  → En Proceso (no filtrable)
  6  → Aceptada
  9  → Cancelada
  12 → Recepción Conforme
  13 → Pendiente de Recepcionar
  14 → Recepcionada Parcialmente
  15 → Recepción Conforme Incompleta

### Formato de fecha
  ddmmaaaa → ej: 07042026 = 7 de abril de 2026

---

## ⚠️ Limitación importante: archivos de licitaciones
  Este MCP NO tiene acceso a los archivos adjuntos de licitaciones ni órdenes de compra
  (bases, anexos, especificaciones técnicas, resoluciones, etc.).
  La API de Mercado Público no retorna links de descarga ni el contenido de los documentos.
  Solo expone datos estructurados (metadatos): montos, fechas, estados, ítems, organismos, etc.
  Para acceder a los documentos: https://www.mercadopublico.cl

---

##  Límites y políticas de uso
  - 10.000 solicitudes diarias por ticket (no modificable)
  - El uso excesivo puede derivar en suspensión temporal o bloqueo permanente del acceso
  - ChileCompra monitorea el uso permanentemente, incluyendo validaciones por dirección IP
  - Consultas masivas: se recomienda horario nocturno 22:00–07:00 hrs Chile
  - buscar_licitaciones_rango procesa en lotes de 5 días para no saturar la IP
  - El ticket es personal e intransferible (un ticket por persona)
  - Al publicar datos obtenidos de esta API sin modificarlos, debes indicar que la fuente es la Dirección ChileCompra
  - Soporte oficial: formulario en https://www.chilecompra.cl/api/ (respuesta en máx. 3 días hábiles)
  - Documentación oficial: https://www.chilecompra.cl/api/
`.trim();

export function registerAyudaTools(server: McpServer): void {
  server.registerTool(
    'ayuda',
    {
      title: 'Ayuda — Guía completa del MCP',
      description:
        'Muestra la guía completa de uso del MCP Mercado Público: ' +
        'todas las herramientas disponibles, sus parámetros, ejemplos de uso, ' +
        'referencia de estados y límites de la API.',
      inputSchema: {},
    },
    () => ({
      content: [{ type: 'text', text: AYUDA_CONTENIDO }],
    }),
  );
}
