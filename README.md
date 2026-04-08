# 🇨🇱 MCP Mercado Público

Servidor **Model Context Protocol (MCP)** para la API pública de [Mercado Público / ChileCompra](https://www.chilecompra.cl/api/). Permite que asistentes de IA consulten licitaciones, órdenes de compra y empresas del Estado chileno en tiempo real.

---

## 🔑 Paso 1: Obtener tu ticket gratuito

Antes de usar el servidor necesitas tu propio ticket (API key):

1. Ir a [api.mercadopublico.cl](https://api.mercadopublico.cl/modules/IniciarSesion.aspx)
2. Iniciar sesión con **Clave Única**
3. Completar el formulario → el ticket llega a tu correo

> El servidor **no almacena credenciales**. El ticket se pasa como parámetro en cada consulta.

---

## ⚙️ Paso 2: Configurar en tu IDE

No necesitas clonar ni compilar nada. Usa `npx` directamente.

Tienes **dos formas** de pasar tu ticket:

| Método | Cuándo usarlo |
|---|---|
| **Variable de entorno `MERCADO_PUBLICO_TICKET`** | Configuras el ticket una sola vez en el IDE — el asistente nunca te lo pedirá |
| **Parámetro `ticket` en cada tool call** | Si no configuraste la env var, pásalo directamente en cada consulta |

Se recomienda usar la variable de entorno para una experiencia fluida.


### Claude Desktop

**Windows:** `%APPDATA%\Claude\claude_desktop_config.json`  
**macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "mercado-publico": {
      "command": "npx",
      "args": ["-y", "mcp-mercado-publico"],
      "env": {
        "MERCADO_PUBLICO_TICKET": "TU-TICKET-AQUI"
      }
    }
  }
}
```

Reinicia Claude Desktop después de guardar.

---

### Cursor

**Global** `~/.cursor/mcp.json` · **Por proyecto** `.cursor/mcp.json`

```json
{
  "mcpServers": {
    "mercado-publico": {
      "command": "npx",
      "args": ["-y", "mcp-mercado-publico"],
      "env": {
        "MERCADO_PUBLICO_TICKET": "TU-TICKET-AQUI"
      }
    }
  }
}
```

Verifica en **Settings → MCP** que el servidor aparezca con punto verde.

---

### VS Code (GitHub Copilot)

> Requiere VS Code 1.99+ y Copilot en **Agent mode**.

**Por proyecto** `.vscode/mcp.json`:

```json
{
  "servers": {
    "mercado-publico": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "mcp-mercado-publico"],
      "env": {
        "MERCADO_PUBLICO_TICKET": "TU-TICKET-AQUI"
      }
    }
  }
}
```

**Global** en `settings.json`:

```json
{
  "mcp": {
    "servers": {
      "mercado-publico": {
        "type": "stdio",
        "command": "npx",
        "args": ["-y", "mcp-mercado-publico"],
        "env": {
          "MERCADO_PUBLICO_TICKET": "TU-TICKET-AQUI"
        }
      }
    }
  }
}
```

---

### Antigravity (Google DeepMind)

`C:\Users\<usuario>\.gemini\antigravity\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "mercado-publico": {
      "command": "npx",
      "args": ["-y", "mcp-mercado-publico"],
      "env": {
        "MERCADO_PUBLICO_TICKET": "TU-TICKET-AQUI"
      }
    }
  }
}
```

---

### Windsurf (Codeium)

`C:\Users\<usuario>\.codeium\windsurf\mcp_config.json`

```json
{
  "mcpServers": {
    "mercado-publico": {
      "command": "npx",
      "args": ["-y", "mcp-mercado-publico"],
      "env": {
        "MERCADO_PUBLICO_TICKET": "TU-TICKET-AQUI"
      }
    }
  }
}
```

---

### Desarrollo local (sin publicar en npm)

Si estás modificando el código fuente, compila primero y apunta al binario local:

```bash
npm install && npm run build
```

```json
{
  "mcpServers": {
    "mercado-publico": {
      "command": "node",
      "args": ["D:\\PROGRAMACION\\NEST-JS\\mcp-mercado-publico\\dist\\main.js"]
    }
  }
}
```

---

## 🛠️ Herramientas disponibles

| Tool | Descripción |
|---|---|
| `buscar_licitaciones` | Lista licitaciones por fecha, estado, proveedor u organismo (nombre o código) |
| `buscar_licitaciones_rango` | Busca licitaciones en un rango de fechas (máximo 30 días) |
| `obtener_licitacion` | Detalle completo de una licitación por su código |
| `buscar_ordenes_de_compra` | Lista órdenes de compra por fecha, estado, proveedor u organismo (nombre o código) |
| `obtener_orden_de_compra` | Detalle completo de una OC por su código |
| `buscar_proveedor` | Busca un proveedor por su RUT |
| `listar_compradores` | Lista todos los organismos públicos disponibles |
| `buscar_organismo` | Busca un organismo público por nombre — retorna su CodigoOrganismo |
| `estructura` | Retorna la estructura de respuesta JSON de la API nativa para cualquier entidad |
| `consultas` | Retorna los parámetros funcionales y diccionarios de anexos para consultar la API |
| `ejemplos_url` | Muestra ejemplos reales de URIs HTTP de la API y los distintos formatos soportados |
| `ayuda` | Muestra la guía completa de uso del MCP, referencias de códigos y límites operativos |

---

## 💬 Ejemplos de uso

Una vez configurado, puedes preguntarle al asistente cosas como:

```
¿Cuáles son las licitaciones activas de hoy?
Mi ticket es F8537A18-6766-4DEF-9E59-426B4FEE2844
```

```
Busca la licitación con código 1509-5-L114 usando mi ticket ABC123-...
```

```
¿Qué órdenes de compra aceptadas existen para el 01042026?
```

```
Busca las licitaciones de la Municipalidad de Alto del Carmen
```

```
Busca el proveedor con RUT 70.017.820-k
```

---

## 📋 Referencia de estados

### Licitaciones — parámetro `estado`

| Valor para `?estado=` | Código en respuesta |
|---|---|
| `activas` | Todas las publicadas hoy |
| `publicada` | 5 |
| `cerrada` | 6 |
| `desierta` | 7 |
| `adjudicada` | 8 |
| `revocada` | 18 |
| `suspendida` | 19 |
| `todos` | Todos los estados |

### Órdenes de Compra — parámetro `estado`

| Valor para `?estado=` | Código en respuesta |
|---|---|
| `enviadaproveedor` | 4 |
| *(sin query param)* | 5 (En proceso, solo en respuesta) |
| `aceptada` | 6 |
| `cancelada` | 9 |
| `recepcionconforme` | 12 |
| `pendienterecepcion` | 13 |
| `recepcionaceptadacialmente` | 14 |
| `recepecionconformeincompleta` | 15 |
| `todos` | Todos los estados |

### Formato de fecha

La API usa `ddmmaaaa`. Ejemplos: `07042026` → 7 de abril de 2026.

---

## 📦 Publicar en npm

```bash
npm login
npm publish   # ejecuta npm run build automáticamente (prepublishOnly)
```

---

## 🏗️ Estructura del proyecto

```
src/
├── main.ts                                           # Bootstrap (modo stdio)
├── app.module.ts
├── common/
│   └── constants/
│       └── api.constants.ts                          # BASE_URL, endpoints, códigos de estado
├── mercado-publico/
│   ├── interfaces/mercado-publico.interfaces.ts      # Tipos de parámetros
│   ├── helpers/query-builder.helper.ts               # Construcción de query params
│   ├── mercado-publico.service.ts                    # Cliente HTTP
│   └── mercado-publico.module.ts
└── mcp/
    ├── constants/tool-schemas.constants.ts           # Campos Zod reutilizables
    ├── tools/
    │   ├── licitaciones.tools.ts
    │   ├── ordenes-compra.tools.ts
    │   ├── empresas.tools.ts
    │   ├── estructura.tools.ts
    │   └── ayuda.tools.ts
    ├── mcp-server.ts
    ├── mcp.service.ts
    └── mcp.module.ts
```

---

## ⚠️ Limitación importante: archivos de licitaciones

Este MCP **no tiene acceso a los archivos adjuntos** de las licitaciones ni de las órdenes de compra (bases de licitación, anexos, especificaciones técnicas, resoluciones, etc.).

La API de Mercado Público **no retorna links de descarga ni el contenido de los documentos**. Solo expone los datos estructurados (metadatos) de cada proceso: montos, fechas, estados, ítems, organismos, etc.

Para acceder a los documentos debes ingresar directamente al portal: [mercadopublico.cl](https://www.mercadopublico.cl)

---

## 📝 Políticas y condiciones de uso de la API

> Las limitaciones descritas a continuación **no son impuestas por este servidor MCP**, sino por la **API oficial de Mercado Público (ChileCompra)**. Este servidor las respeta y documenta para que los usuarios las conozcan antes de usar el servicio.


### Uso del ticket

- El ticket se solicita mediante formulario oficial seleccionando la opción **"Solicitud de Ticket"**.
- Debe completarse con datos reales: nombre, apellido, RUT y correo electrónico.
- Se entrega **un único ticket por persona**. Datos inconsistentes pueden derivar en limitación o suspensión del acceso.
- ChileCompra usa los datos personales únicamente para operación, control y administración del servicio — no los comparte con terceros, salvo mandato judicial.

### Límites de uso

- **10.000 solicitudes diarias** por ticket — no modificable.
- El uso excesivo o abusivo puede derivar en **suspensión temporal o bloqueo permanente**.
- La API incluye **validaciones por dirección IP**: múltiples solicitudes desde la misma IP pueden generar restricciones.
- Para procesos de alta demanda o descarga masiva, usar **horario nocturno (22:00–07:00 hrs, Chile)**.

### Soporte

- Soporte únicamente a través del formulario de sugerencias del sitio web de ChileCompra.
- Plazo de respuesta: máximo **3 días hábiles**.
- No se atienden solicitudes informales ni por correo institucional directo.

### Responsabilidad

- La API es un servicio adicional y voluntario — ChileCompra puede modificarla, suspenderla o darla de baja sin previo aviso.
- ChileCompra no se hace responsable de la información publicada por terceros mediante aplicaciones que usen la API.
- Al publicar datos obtenidos desde la API **sin modificarlos**, debe indicarse que la fuente es la **Dirección ChileCompra**.

Documentación oficial: [chilecompra.cl/api](https://www.chilecompra.cl/api/)

---

## 🤝 Fuente de datos

Datos de [Mercado Público](https://www.mercadopublico.cl/), **Dirección ChileCompra**, Ministerio de Hacienda, Gobierno de Chile.
