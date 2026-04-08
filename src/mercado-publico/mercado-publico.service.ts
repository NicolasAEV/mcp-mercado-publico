import { Injectable, HttpException } from '@nestjs/common';
import axios, { AxiosError } from 'axios';
import {
  MP_BASE_URL,
  MP_ENDPOINTS,
} from '../common/constants/api.constants.js';
import type {
  LicitacionesParams,
  OrdenesDeCompraParams,
  MpQueryParams,
} from './interfaces/mercado-publico.interfaces.js';
import {
  buildLicitacionesQuery,
  buildOrdenesDeCompraQuery,
} from './helpers/query-builder.helper.js';

@Injectable()
export class MercadoPublicoService {
  // ─── HTTP ─────────────────────────────────────────────────────────────────

  private async get<T>(path: string, params: MpQueryParams): Promise<T> {
    try {
      const { data } = await axios.get<T>(`${MP_BASE_URL}${path}`, { params });
      return data;
    } catch (err) {
      const error = err as AxiosError<{ message?: string }>;
      const status = error.response?.status ?? 500;
      const message: string =
        error.response?.data?.message ??
        error.message ??
        'Error al conectar con la API de Mercado Público';
      throw new HttpException(message, status);
    }
  }

  // ─── LICITACIONES ─────────────────────────────────────────────────────────

  /**
   * Busca licitaciones por fecha (día exacto).
   * Si se filtra por organismo o proveedor sin especificar fecha,
   * busca automáticamente los últimos 30 días para no devolver resultados vacíos.
   */
  async getLicitaciones(params: LicitacionesParams): Promise<unknown> {
    if (params.nombreOrganismo && !params.codigoOrganismo) {
      params.codigoOrganismo = await this.resolverCodigoOrganismo(
        params.ticket,
        params.nombreOrganismo,
      );
    }
    if (!params.fecha && (params.codigoOrganismo ?? params.codigoProveedor)) {
      const hoy = new Date();
      const hace30 = new Date(hoy);
      hace30.setDate(hoy.getDate() - 29);
      return this.getLicitacionesRango(
        params.ticket,
        this.formatFecha(hace30),
        this.formatFecha(hoy),
        params.estado,
        params.codigoOrganismo,
        params.codigoProveedor,
      );
    }
    return this.get(MP_ENDPOINTS.licitaciones, buildLicitacionesQuery(params));
  }

  getLicitacionPorCodigo(ticket: string, codigo: string): Promise<unknown> {
    return this.get(MP_ENDPOINTS.licitaciones, { ticket, codigo });
  }

  /**
   * Busca licitaciones en un rango de fechas iterando día a día.
   * Máximo 30 días para respetar el límite de 10.000 requests/día por ticket.
   * Formato de fechas: ddmmaaaa
   */
  async getLicitacionesRango(
    ticket: string,
    fechaInicio: string,
    fechaFin: string,
    estado?: string,
    codigoOrganismo?: string,
    codigoProveedor?: string,
  ): Promise<unknown> {
    const inicio = this.parseFecha(fechaInicio);
    const fin = this.parseFecha(fechaFin);
    const diffDias =
      Math.ceil((fin.getTime() - inicio.getTime()) / 86_400_000) + 1;

    if (diffDias > 30) {
      throw new Error(
        `El rango de fechas no puede superar 30 días (solicitados: ${diffDias}). ` +
          `Divide la búsqueda en intervalos menores para no superar el límite de la API.`,
      );
    }

    const fechas = this.generarFechasRango(inicio, fin);

    // Procesamos en lotes de 5 días para no saturar la IP ni exceder límites.
    // Política ChileCompra: validaciones por IP; uso excesivo puede derivar en bloqueo.
    const BATCH_SIZE = 5;
    const resultados: unknown[] = [];
    for (let i = 0; i < fechas.length; i += BATCH_SIZE) {
      const lote = fechas.slice(i, i + BATCH_SIZE);
      const items = await this.fetchLicitacionesLote(
        lote,
        ticket,
        estado,
        codigoOrganismo,
        codigoProveedor,
      );
      resultados.push(...items);
    }

    return {
      Cantidad: resultados.length,
      FechaInicio: fechaInicio,
      FechaFin: fechaFin,
      DiasConsultados: diffDias,
      Listado: resultados,
    };
  }

  private parseFecha(f: string): Date {
    const d = f.slice(0, 2),
      m = f.slice(2, 4),
      a = f.slice(4, 8);
    return new Date(`${a}-${m}-${d}`);
  }

  private formatFecha(date: Date): string {
    const d = String(date.getDate()).padStart(2, '0');
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const a = date.getFullYear();
    return `${d}${m}${a}`;
  }

  private generarFechasRango(inicio: Date, fin: Date): string[] {
    const fechas: string[] = [];
    const current = new Date(inicio);
    while (current <= fin) {
      fechas.push(this.formatFecha(current));
      current.setDate(current.getDate() + 1);
    }
    return fechas;
  }

  private async fetchLicitacionesLote(
    fechas: string[],
    ticket: string,
    estado?: string,
    codigoOrganismo?: string,
    codigoProveedor?: string,
  ): Promise<unknown[]> {
    const respuestas = await Promise.all(
      fechas.map((fecha) => {
        const params: LicitacionesParams = { ticket, fecha };
        if (estado) params.estado = estado;
        if (codigoOrganismo) params.codigoOrganismo = codigoOrganismo;
        if (codigoProveedor) params.codigoProveedor = codigoProveedor;
        return this.get<{ Listado?: unknown[] }>(
          MP_ENDPOINTS.licitaciones,
          buildLicitacionesQuery(params),
        ).catch(() => ({ Listado: [] as unknown[] }));
      }),
    );
    return respuestas.flatMap((resp) => resp?.Listado ?? []);
  }

  // ─── ÓRDENES DE COMPRA ────────────────────────────────────────────────────

  /**
   * Busca órdenes de compra por fecha (día exacto).
   * Si se filtra por organismo o proveedor sin especificar fecha,
   * busca automáticamente los últimos 30 días para no devolver resultados vacíos.
   */
  async getOrdenesDeCompra(params: OrdenesDeCompraParams): Promise<unknown> {
    if (params.nombreOrganismo && !params.codigoOrganismo) {
      params.codigoOrganismo = await this.resolverCodigoOrganismo(
        params.ticket,
        params.nombreOrganismo,
      );
    }
    if (!params.fecha && (params.codigoOrganismo ?? params.codigoProveedor)) {
      const hoy = new Date();
      const hace30 = new Date(hoy);
      hace30.setDate(hoy.getDate() - 29);
      return this.getOrdenesDeCompraRango(
        params.ticket,
        this.formatFecha(hace30),
        this.formatFecha(hoy),
        params.estado,
        params.codigoOrganismo,
        params.codigoProveedor,
      );
    }
    return this.get(
      MP_ENDPOINTS.ordenesDeCompra,
      buildOrdenesDeCompraQuery(params),
    );
  }

  async getOrdenesDeCompraRango(
    ticket: string,
    fechaInicio: string,
    fechaFin: string,
    estado?: string,
    codigoOrganismo?: string,
    codigoProveedor?: string,
  ): Promise<unknown> {
    const inicio = this.parseFecha(fechaInicio);
    const fin = this.parseFecha(fechaFin);
    const diffDias =
      Math.ceil((fin.getTime() - inicio.getTime()) / 86_400_000) + 1;

    if (diffDias > 30) {
      throw new Error(
        `El rango de fechas no puede superar 30 días (solicitados: ${diffDias}). ` +
          `Divide la búsqueda en intervalos menores para no superar el límite de la API.`,
      );
    }

    const fechas = this.generarFechasRango(inicio, fin);

    const BATCH_SIZE = 5;
    const resultados: unknown[] = [];
    for (let i = 0; i < fechas.length; i += BATCH_SIZE) {
      const lote = fechas.slice(i, i + BATCH_SIZE);
      const items = await this.fetchOrdenesLote(
        lote,
        ticket,
        estado,
        codigoOrganismo,
        codigoProveedor,
      );
      resultados.push(...items);
    }

    return {
      Cantidad: resultados.length,
      FechaInicio: fechaInicio,
      FechaFin: fechaFin,
      DiasConsultados: diffDias,
      Listado: resultados,
    };
  }

  private async fetchOrdenesLote(
    fechas: string[],
    ticket: string,
    estado?: string,
    codigoOrganismo?: string,
    codigoProveedor?: string,
  ): Promise<unknown[]> {
    const respuestas = await Promise.all(
      fechas.map((fecha) => {
        const params: OrdenesDeCompraParams = { ticket, fecha };
        if (estado) params.estado = estado;
        if (codigoOrganismo) params.codigoOrganismo = codigoOrganismo;
        if (codigoProveedor) params.codigoProveedor = codigoProveedor;
        return this.get<{ Listado?: unknown[] }>(
          MP_ENDPOINTS.ordenesDeCompra,
          buildOrdenesDeCompraQuery(params),
        ).catch(() => ({ Listado: [] as unknown[] }));
      }),
    );
    return respuestas.flatMap((resp) => resp?.Listado ?? []);
  }

  getOrdenDeCompraPorCodigo(ticket: string, codigo: string): Promise<unknown> {
    return this.get(MP_ENDPOINTS.ordenesDeCompra, { ticket, codigo });
  }

  // ─── EMPRESAS ─────────────────────────────────────────────────────────────

  buscarProveedor(
    ticket: string,
    rutEmpresaProveedor: string,
  ): Promise<unknown> {
    return this.get(MP_ENDPOINTS.buscarProveedor, {
      ticket,
      rutempresaproveedor: rutEmpresaProveedor,
    });
  }

  buscarCompradores(ticket: string): Promise<unknown> {
    return this.get(MP_ENDPOINTS.buscarComprador, { ticket });
  }

  /**
   * Busca organismos públicos cuyo nombre contenga el texto indicado (case-insensitive).
   * Llama a BuscarComprador y filtra la lista localmente, ya que la API no soporta búsqueda por nombre.
   * Normaliza CodigoEmpresa → CodigoOrganismo para usarlo directamente en otras herramientas.
   */
  async buscarOrganismoPorNombre(
    ticket: string,
    nombre: string,
  ): Promise<unknown> {
    const resultados = await this.filtrarOrganismos(ticket, nombre);
    return {
      Cantidad: resultados.length,
      terminoBuscado: nombre,
      Listado: resultados,
    };
  }

  /**
   * Resuelve el nombre de un organismo a su CodigoOrganismo (primer resultado exacto).
   * Lanza error descriptivo si no encuentra ninguna coincidencia.
   */
  private async resolverCodigoOrganismo(
    ticket: string,
    nombre: string,
  ): Promise<string> {
    const resultados = await this.filtrarOrganismos(ticket, nombre);
    if (resultados.length === 0) {
      throw new Error(
        `No se encontró ningún organismo que coincida con "${nombre}". ` +
          `Usa buscar_organismo para explorar los organismos disponibles.`,
      );
    }
    const codigo = resultados[0]['CodigoOrganismo'];
    if (typeof codigo !== 'string' || codigo === '') {
      throw new TypeError(`El organismo encontrado no tiene un código válido.`);
    }
    return codigo;
  }

  private async filtrarOrganismos(
    ticket: string,
    nombre: string,
  ): Promise<Array<{ CodigoOrganismo: string; NombreOrganismo: string }>> {
    const response = await this.get<{
      listaEmpresas?: Array<Record<string, unknown>>;
    }>(MP_ENDPOINTS.buscarComprador, { ticket });

    const listado = response?.listaEmpresas ?? [];
    const nombreLower = nombre.toLowerCase();

    return listado
      .filter((org) => {
        const nombreOrg = (
          typeof org['NombreEmpresa'] === 'string' ? org['NombreEmpresa'] : ''
        ).toLowerCase();
        return nombreOrg.includes(nombreLower);
      })
      .map((org) => ({
        CodigoOrganismo:
          typeof org['CodigoEmpresa'] === 'string' ||
          typeof org['CodigoEmpresa'] === 'number'
            ? String(org['CodigoEmpresa'])
            : '',
        NombreOrganismo:
          typeof org['NombreEmpresa'] === 'string' ? org['NombreEmpresa'] : '',
      }));
  }
}
