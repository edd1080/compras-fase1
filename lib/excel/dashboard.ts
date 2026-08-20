import * as XLSX from "xlsx";
import type { MetricasDashboard } from "@/lib/domain/metrics";
import type { Solicitud } from "@/lib/domain/types";

type Datos = {
  metricas: MetricasDashboard;
  procesos: Solicitud[];
  nombreCoordinador: (id?: string) => string;
};

export function generarExcelDashboard(d: Datos): Buffer {
  const libro = XLSX.utils.book_new();

  const kpis = [
    ["Conversión (aceptación)", d.metricas.tasaConversion === null ? "sin datos" : `${d.metricas.tasaConversion.toFixed(0)}%`],
    ["Tiempo promedio (días)", d.metricas.tiempoCicloPromedioDias === null ? "sin datos" : d.metricas.tiempoCicloPromedioDias.toFixed(1)],
    ["Procesos activos", d.metricas.solicitudesActivas],
    ["Sin decisión > 5 días", d.metricas.solicitudesSinDecision],
  ];
  XLSX.utils.book_append_sheet(libro, XLSX.utils.aoa_to_sheet([["Métricas"], ...kpis]), "Métricas");

  const filas = d.procesos.map((s) => [
    s.numeroReferencia ?? "—",
    s.titulo,
    s.solicitanteNombre,
    d.nombreCoordinador(s.coordinadorId),
    s.estado,
    s.fechaCreacion?.split("T")[0] ?? "—",
  ]);
  XLSX.utils.book_append_sheet(
    libro,
    XLSX.utils.aoa_to_sheet([["Referencia", "Título", "Solicitante", "Coordinador", "Estado", "Creación"], ...filas]),
    "Procesos"
  );

  const wbout = XLSX.write(libro, { bookType: "xlsx", type: "buffer" });
  return wbout as Buffer;
}