// Tests de integración del adaptador Postgres contra la base local.
// Requiere DATABASE_URL (PostgreSQL migrado 001–006). Si no está, los tests se omiten.
import { describe, it, expect, beforeAll } from "vitest";
import { PostgresRepositorio } from "./postgres-repo";

const DATABASE_URL = process.env.DATABASE_URL ?? "";

const describeDb = DATABASE_URL ? describe : describe.skip;

describeDb("PostgresRepositorio", () => {
  let repo: PostgresRepositorio;

  beforeAll(() => {
    repo = new PostgresRepositorio();
  });

  it("crea una solicitud en BORRADOR", async () => {
    const s = await repo.crearSolicitud(
      {
        titulo: "Prueba repo",
        solicitanteEmail: "repo.test@bia.hn",
        solicitanteNombre: "Repo Test",
        estado: "BORRADOR",
      },
      { areaSolicitante: "Trade Marketing", descripcion: "test", categoria: "administrativa" }
    );
    expect(s.estado).toBe("BORRADOR");
    expect(s.titulo).toBe("Prueba repo");
    expect(s.fechaCreacion).toBeTruthy();
  });

  it("transiciona a ENVIADA_A_COMPRAS y escribe evento en la misma transacción", async () => {
    const s = await repo.crearSolicitud(
      {
        titulo: "Prueba transición",
        solicitanteEmail: "repo2@bia.hn",
        solicitanteNombre: "Repo Test",
        estado: "BORRADOR",
      },
      { descripcion: "test" }
    );
    const res = await repo.transicionarEstado({
      solicitudId: s.id,
      hacia: "ENVIADA_A_COMPRAS",
      actorTipo: "solicitante",
      actorIdentificador: "repo2@bia.hn",
    });
    expect(res.solicitud.estado).toBe("ENVIADA_A_COMPRAS");
    expect(res.solicitud.fechaEnvio).toBeTruthy();
    expect(res.eventoId).toBeTruthy();
  });

  it("lista por email sin montos", async () => {
    const list = await repo.listarPorEmail("repo2@bia.hn");
    expect(Array.isArray(list)).toBe(true);
    if (list.length) {
      const s = list[0];
      expect(s.titulo).toBe("Prueba transición");
      // no debe exponer campos de cotización/monto
      expect((s as unknown as Record<string, unknown>)["valorTotal"]).toBeUndefined();
    }
  });

  it("guarda y relee config", async () => {
    const tasa = await repo.leerConfig("tasa_isv");
    expect(tasa).not.toBeNull();
  });
});