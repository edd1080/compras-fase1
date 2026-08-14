import { describe, it, expect, vi, beforeEach } from "vitest";
import { enviarCorreo } from "./enviar";
import { renderCorreo } from "./plantillas";
import type { CorreoEnviado } from "@/lib/domain/types";
import type { Repositorio } from "@/lib/db/repositorio";

vi.mock("./cliente", () => ({
  enviarConResend: vi.fn(),
  getRemitente: () => "Portal de Compras BIA <no-reply@compras.bia>",
}));

import { enviarConResend } from "./cliente";

function mockRepo() {
  return {
    registrarCorreo: vi.fn(async (input): Promise<CorreoEnviado> => ({
      id: "c1",
      solicitudId: input.solicitudId,
      tipoCorreo: input.tipoCorreo,
      destinatario: input.destinatario,
      asunto: input.asunto,
      estadoEnvio: input.estadoEnvio,
      intentos: input.intentos ?? 1,
      errorDetalle: input.errorDetalle,
      fechaEnvio: "2026-08-13T12:00:00Z",
    })),
  } as unknown as Repositorio;
}

const datos = {
  numeroReferencia: "RFQ-2026-014",
  titulo: "Sombrillas brandeadas",
  coordinadorNombre: "Carlos Mejía",
  solicitanteNombre: "María Reyes",
  tipo: "RFQ",
  area: "Marketing",
};

describe("envio de correo", () => {
  beforeEach(() => vi.clearAllMocks());

  it("registra como enviado cuando Resend responde ok", async () => {
    vi.mocked(enviarConResend).mockResolvedValue({ ok: true, id: "email_1" });
    const repo = mockRepo();
    const c = await enviarCorreo({ repo, tipoCorreo: "1", solicitudId: "s1", destinatario: "carlos@bia.com", datos });
    expect(c.estadoEnvio).toBe("enviado");
    expect(repo.registrarCorreo).toHaveBeenCalledTimes(1);
  });

  it("registra como fallido tras reintentos y guarda el error", async () => {
    vi.mocked(enviarConResend).mockResolvedValue({ ok: false, error: "bounce" });
    const repo = mockRepo();
    const c = await enviarCorreo({ repo, tipoCorreo: "1", solicitudId: "s1", destinatario: "carlos@bia.com", datos, reintentos: 2 });
    expect(c.estadoEnvio).toBe("fallido");
    expect(c.errorDetalle).toBe("bounce");
    expect(enviarConResend).toHaveBeenCalledTimes(2);
  });

  it("correo 3 incluye el enlace público", () => {
    const { asunto, html } = renderCorreo("3", { ...datos, urlComparativa: "https://bia.com/c/tok123" });
    expect(html).toContain("tok123");
    expect(asunto).toContain("comparativo");
  });
});