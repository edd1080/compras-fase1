// Fixtures tipados — Portal de Compras BIA
// Datos derivados del modelo real (tipos de lib/domain), no mock inline.
// Reemplazables por API cuando exista el backend; MANTENER la forma de lib/domain.
import type {
  Comparativa,
  Cotizacion,
  Solicitud,
  Usuario,
} from "../domain/types";
import {
  construirComparativa,
} from "../domain/comparativa";

export const usuariosFixture: Usuario[] = [
  { id: "u1", nombre: "Carlos Mejía", email: "carlos.mejia@compras.bia.hn", rol: "coordinador", categoriasAsignadas: ["materia_prima", "mercadeo_publicidad"], activo: true },
  { id: "u2", nombre: "Ana Paredes", email: "ana.paredes@compras.bia.hn", rol: "coordinador", categoriasAsignadas: ["servicios_logisticos"], activo: true },
  { id: "u3", nombre: "Jorge Salinas", email: "jorge.salinas@compras.bia.hn", rol: "coordinador", categoriasAsignadas: ["capex_indirectos"], activo: true },
  { id: "u4", nombre: "Fátima Cruz", email: "fatima.cruz@compras.bia.hn", rol: "coordinador", categoriasAsignadas: ["tecnologia"], activo: true },
  { id: "u5", nombre: "Lady Matute", email: "lady.matute@compras.bia.hn", rol: "admin", categoriasAsignadas: [], activo: true },
];

export const coordinadores = usuariosFixture.filter((u) => u.rol === "coordinador");

export const solicitudesFixture: Solicitud[] = [
  {
    id: "s014",
    numeroReferencia: "RFQ-2026-014",
    tipo: "RFQ",
    subtipo: "producto",
    categoria: "mercadeo_publicidad",
    estado: "EN_COTIZACION",
    titulo: "Sombrillas brandeadas — activación Café Oro playa",
    descripcion: "200 sombrillas brandeadas con el logo de Café Oro para activación de playa en agosto.",
    solicitanteEmail: "maria.reyes@bia.hn",
    solicitanteNombre: "María Reyes",
    areaSolicitante: "Trade Marketing",
    coordinadorId: "u1",
    fechaRequerida: "2026-08-25",
    fechaCreacion: "2026-07-20T10:00:00Z",
    clasificacionCorregida: false,
    notificacionFallida: false,
  },
  {
    id: "s013",
    numeroReferencia: "RFQ-2026-013",
    tipo: "RFQ",
    subtipo: "producto",
    categoria: "materia_prima",
    estado: "EN_COTIZACION",
    titulo: "Materia prima empaque",
    solicitanteEmail: "douglas.paz@bia.hn",
    solicitanteNombre: "Douglas Paz",
    coordinadorId: "u2",
    fechaRequerida: "2026-08-30",
    fechaCreacion: "2026-07-22T09:00:00Z",
    clasificacionCorregida: false,
    notificacionFallida: false,
  },
  {
    id: "s005",
    numeroReferencia: "RFP-2026-005",
    tipo: "RFP",
    subtipo: "servicio",
    categoria: "capex_indirectos",
    estado: "COMPARATIVA_LISTA",
    titulo: "Ampliación de bodega de almacenamiento",
    solicitanteEmail: "milton.aguilar@bia.hn",
    solicitanteNombre: "Milton Aguilar",
    coordinadorId: "u3",
    fechaRequerida: "2026-09-15",
    fechaCreacion: "2026-07-18T14:00:00Z",
    clasificacionCorregida: false,
    notificacionFallida: false,
  },
  {
    id: "s009",
    numeroReferencia: "RFI-2026-009",
    tipo: "RFI",
    subtipo: "producto",
    categoria: "tecnologia",
    estado: "ENVIADA_A_COMPRAS",
    titulo: "Exploración de soluciones de almacenamiento",
    solicitanteEmail: "karla.nunez@bia.hn",
    solicitanteNombre: "Karla Núñez",
    coordinadorId: "u4",
    fechaRequerida: "2026-08-18",
    fechaCreacion: "2026-07-25T08:30:00Z",
    clasificacionCorregida: false,
    notificacionFallida: false,
  },
  {
    id: "s012",
    numeroReferencia: "RFQ-2026-012",
    tipo: "RFQ",
    subtipo: "producto",
    categoria: "administrativa",
    estado: "CERRADA_CON_DECISION",
    titulo: "Equipo de oficina planta baja",
    solicitanteEmail: "douglas.paz@bia.hn",
    solicitanteNombre: "Douglas Paz",
    coordinadorId: "u1",
    fechaRequerida: "2026-07-24",
    fechaCreacion: "2026-07-15T10:00:00Z",
    fechaEnvio: "2026-07-15T11:00:00Z",
    fechaCierre: "2026-07-19T16:00:00Z",
    clasificacionCorregida: false,
    notificacionFallida: false,
  },
  {
    id: "s011",
    numeroReferencia: "RFQ-2026-011",
    tipo: "RFQ",
    subtipo: "servicio",
    categoria: "servicios_logisticos",
    estado: "CERRADA_SIN_DECISION",
    titulo: "Servicio de mensajería interna",
    solicitanteEmail: "sofia.leon@bia.hn",
    solicitanteNombre: "Sofía León",
    coordinadorId: "u2",
    fechaRequerida: "2026-07-30",
    fechaCreacion: "2026-07-10T09:00:00Z",
    fechaCierre: "2026-07-20T15:00:00Z",
    clasificacionCorregida: false,
    notificacionFallida: false,
  },
  {
    id: "s004",
    numeroReferencia: "RFP-2026-004",
    tipo: "RFP",
    subtipo: "servicio",
    categoria: "capex_indirectos",
    estado: "EN_COTIZACION",
    titulo: "Instalación de paneles solares",
    solicitanteEmail: "nelson.ochoa@bia.hn",
    solicitanteNombre: "Nelson Ochoa",
    coordinadorId: "u3",
    fechaRequerida: "2026-10-10",
    fechaCreacion: "2026-07-14T11:00:00Z",
    clasificacionCorregida: false,
    notificacionFallida: false,
  },
  {
    id: "s010",
    numeroReferencia: "RFQ-2026-010",
    tipo: "RFQ",
    subtipo: "producto",
    categoria: "tecnologia",
    estado: "CERRADA_CON_DECISION",
    titulo: "Laptops para el equipo de ventas",
    solicitanteEmail: "mafer.duque@bia.hn",
    solicitanteNombre: "Máfer Duque",
    coordinadorId: "u4",
    fechaRequerida: "2026-07-20",
    fechaCreacion: "2026-07-08T10:00:00Z",
    fechaCierre: "2026-07-13T15:00:00Z",
    clasificacionCorregida: false,
    notificacionFallida: false,
  },
];

export const cotizacionesFixture: Record<string, Cotizacion[]> = {
  s014: [
    {
      id: "c1",
      solicitudId: "s014",
      proveedorNombre: "Publicidad Total",
      formatoOriginal: "pdf",
      valorNeto: 42000,
      moneda: "HNL",
      impuestosDesglosados: true,
      montoIsv: 6300,
      valorTotal: 48300,
      plazoEntrega: "5 días hábiles",
      especificacionesOfertadas: { material: "Poliéster UV, mástil de madera", dimensiones: "2.0 m" },
      confianzaExtraccion: { valorNeto: 0.95 },
      editadaManualmente: false,
      fechaCarga: "2026-07-21T09:00:00Z",
    },
    {
      id: "c2",
      solicitudId: "s014",
      proveedorNombre: "Impresos del Valle",
      formatoOriginal: "docx",
      valorNeto: 38500,
      moneda: "HNL",
      impuestosDesglosados: true,
      montoIsv: 5775,
      valorTotal: 44275,
      plazoEntrega: "8 días hábiles",
      especificacionesOfertadas: { material: "Poliéster UV, mástil de madera", dimensiones: "2.0 m" },
      confianzaExtraccion: { valorNeto: 0.9 },
      editadaManualmente: false,
      fechaCarga: "2026-07-21T10:00:00Z",
    },
    {
      id: "c3",
      solicitudId: "s014",
      proveedorNombre: "GrafiMax",
      formatoOriginal: "imagen",
      valorNeto: 36000,
      moneda: "HNL",
      impuestosDesglosados: false,
      valorTotal: 36000,
      plazoEntrega: "6 días hábiles",
      especificacionesOfertadas: { material: "Poliéster, mástil de metal" },
      confianzaExtraccion: { valorNeto: 0.7 },
      editadaManualmente: false,
      fechaCarga: "2026-07-21T11:00:00Z",
    },
  ],
};

export function comparativaFixture(solicitudId: string): Comparativa | null {
  const cotizaciones = cotizacionesFixture[solicitudId];
  if (!cotizaciones || cotizaciones.length < 2) return null;
  const solicitud = solicitudesFixture.find((s) => s.id === solicitudId);
return {
      ...construirComparativa({
        solicitudId,
        especificacionesSolicitadas: {
          material: "Poliéster resistente a UV, mástil de madera tratada",
          dimensiones: "2.0 m de diámetro",
        },
        requerimiento: solicitud?.titulo ?? "Solicitud",
        cotizaciones,
      }),
      recomendacionComprador: undefined,
      fechaGeneracion: "2026-07-22T12:00:00Z",
    };
}

export function comparativasFixture(): Comparativa {
  const cmp = comparativaFixture("s014");
  return (
    cmp ?? {
      id: "cmp-none",
      solicitudId: "s014",
      prosContras: {},
      discrepanciasDetectadas: [],
      fechaGeneracion: "2026-07-22T12:00:00Z",
    }
  );
}