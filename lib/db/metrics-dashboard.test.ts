import { describe, it, expect } from "vitest";
import { PostgresRepositorio } from "./postgres-repo";
import type { Pool } from "pg";

// Mock de pool realista: distingue por SQL y devuelve filas coherentes para
// cada agregación de metricsDashboard. Refleja el comportamiento SQL real.
function mockPool(respuestas: Record<string, () => Record<string, unknown>[]>): Pool {
  const q = async (sql: string, ..._args: unknown[]) => {
    let filas: Record<string, unknown>[] = [];
    for (const [fragmento, factory] of Object.entries(respuestas)) {
      if (sql.includes(fragmento)) {
        filas = factory();
        break;
      }
    }
    return { rows: filas, rowCount: filas.length };
  };
  return { query: q } as unknown as Pool;
}

describe("metricsDashboard (mock pool)", () => {
  it("calcula conversión, activas y sin decisión sin filtros", async () => {
    const repo = new PostgresRepositorio(mockPool({
      // count escalar (n)
      "SELECT count(*)": () => [{ n: 5 }],
      // AVG tiempo ciclo → null (sin CERRADAS con fechas)
      "EXTRACT(EPOCH": () => [{ d: null }],
      // volumen por coordinador
      "GROUP BY coordinador_id": () => [
        { c: "u1", k: 3 },
        { c: "u2", k: 2 },
      ],
      // distribución por tipo
      "GROUP BY t": () => [
        { t: "RFQ", k: 4 },
        { t: "RFP", k: 1 },
      ],
    }));
    const m = await repo.metricasDashboard();
    expect(m.tasaConversion).toBe(100); // 5 cerradas / 5 enviadas
    expect(m.solicitudesActivas).toBe(5);
    expect(m.solicitudesSinDecision).toBe(5);
    expect(m.tiempoCicloPromedioDias).toBeNull();
    expect(m.volumenPorCoordinador).toEqual({ u1: 3, u2: 2 });
    expect(m.distribucionPorTipo).toEqual({ RFQ: 4, RFP: 1 });
  });

  it("devuelve null en conversión cuando no hay solicitudes", async () => {
    const repo = new PostgresRepositorio(mockPool({
      "SELECT count(*)": () => [{ n: 0 }],
      "EXTRACT(EPOCH)": () => [{ d: null }],
      "GROUP BY coordinador_id": () => [],
      "GROUP BY t": () => [],
    }));
    const m = await repo.metricasDashboard();
    expect(m.tasaConversion).toBeNull();
    expect(m.solicitudesActivas).toBe(0);
    expect(m.solicitudesSinDecision).toBe(0);
    expect(m.volumenPorCoordinador).toEqual({});
    expect(m.distribucionPorTipo).toEqual({});
  });
});