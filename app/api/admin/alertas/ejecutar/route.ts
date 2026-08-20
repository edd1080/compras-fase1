import { NextResponse } from "next/server";
import { PostgresRepositorio } from "@/lib/db/postgres-repo";
import { detectarAlertas } from "@/lib/domain/alertas";
import type { Cotizacion } from "@/lib/domain/types";

const repo = new PostgresRepositorio();

export async function POST() {
  try {
    const umbral = Number((await repo.leerConfig("umbral_dias_sin_movimiento")) ?? 5);
    const dest = String((await repo.leerConfig("destinatario_alertas")) ?? "");

    const solicitudes = await repo.listarTodas();
    const cotsMap: Record<string, Cotizacion[]> = {};
    for (const s of solicitudes) cotsMap[s.id] = await repo.listarCotizaciones(s.id);

    const alertas = detectarAlertas({ solicitudes, cotizacionesPorSolicitud: cotsMap, umbralDias: umbral });

    // Enviar correo tipo 5 (alerta de inactividad) al destinatario configurado, si existe.
    let enviadas = 0;
    if (dest) {
      const { enviarCorreo } = await import("@/lib/mail/enviar");
      for (const a of alertas.filter((x) => x.tipo === "inactividad")) {
        await enviarCorreo({
          repo,
          tipoCorreo: "5",
          solicitudId: a.solicitudId,
          destinatario: dest,
          datos: {
            diasSinMovimiento: umbral,
            estadoActual: a.titulo,
            urlDetalle: `${process.env.NEXT_PUBLIC_APP_URL ?? ""}/panel/solicitud/${a.solicitudId}`,
          },
        })
          .then(() => { enviadas += 1; })
          .catch(() => undefined);
      }
    }

    return NextResponse.json({ alertas, correosEnviados: enviadas });
  } catch {
    return NextResponse.json({ error: "Error al ejecutar alertas" }, { status: 500 });
  }
}
