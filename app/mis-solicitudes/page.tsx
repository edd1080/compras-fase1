"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/Button";
import { Field } from "@/components/Field";
import { EmptyState } from "@/components/ui-ext/EmptyState";
import { Badge } from "@/components/Badge";
import { api, type SalidaCorta } from "@/lib/api-client";

export default function MisSolicitudesPage() {
  const [email, setEmail] = useState("");
  const [buscado, setBuscado] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resultados, setResultados] = useState<SalidaCorta[]>([]);

  async function buscar(e?: React.FormEvent) {
    e?.preventDefault();
    if (!email.trim()) return;
    setBuscado(email);
    setCargando(true);
    setError(null);
    try {
      const res = await api.misSolicitudes(email);
      setResultados(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al consultar");
      setResultados([]);
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="mx-auto max-w-[900px] px-8 py-10">
      <h1 className="font-display text-[28px] font-semibold text-azul-marino">
        Mis solicitudes
      </h1>
      <p className="mt-2 text-[14px] text-texto-secundario">
        Consultá el estado de tus solicitudes sin iniciar sesión. Esta vista nunca muestra
        precios ni cotizaciones.
      </p>

      <form
        className="mt-6 flex max-w-[480px] items-end gap-3"
        onSubmit={buscar}
      >
        <Field label="Tu correo" required className="flex-1">
          {({ id, ...aria }) => (
            <input
              id={id}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="maria.reyes@bia.hn"
              className="w-full rounded-field border-[1.5px] border-borde-fuerte bg-fondo px-3.5 py-3 text-[14.5px] focus:border-azul-medio focus:bg-superficie focus:outline-none"
              {...aria}
            />
          )}
        </Field>
        <Button type="submit" disabled={!email.includes("@")}>Ver mis solicitudes</Button>
      </form>

      {buscado !== null ? (
        cargando ? (
          <p className="mt-8 text-[13.5px] text-texto-secundario">Consultando…</p>
        ) : error ? (
          <EmptyState
            title="Ocurrió un problema al consultar"
            description={error}
            action={<Button variant="secondary" onClick={() => buscar()}>Reintentar</Button>}
          />
        ) : resultados.length === 0 ? (
          <div className="mt-8">
            <EmptyState
              title="No encontramos solicitudes con este correo"
              description="Si es la primera vez que solicitás una compra, podés crear una nueva."
              action={
                <Link href="/">
                  <Button variant="secondary">Crear una solicitud</Button>
                </Link>
              }
            />
          </div>
        ) : (
          <div className="mt-8 flex flex-col gap-3">
            {resultados.map((s) => (
              <div
                key={s.id}
                className="flex items-center gap-4 rounded-card border border-borde bg-superficie px-5 py-4 shadow-card"
              >
                <span className="w-[130px] shrink-0 font-mono text-[13px] font-medium">
                  {s.numeroReferencia ?? "—"}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="text-[13.5px] font-semibold">{s.titulo}</div>
                  <div className="mt-0.5 text-[12px] text-slate">
                    Creada: {s.fechaCreacion ? new Date(s.fechaCreacion).toLocaleDateString("es-HN") : "—"}
                  </div>
                </div>
                <Badge label={estadoLegible(s.estado)} tone={toneDe(s.estado)} />
              </div>
            ))}
          </div>
        )
      ) : null}
    </div>
  );
}

function estadoLegible(e: string): string {
  const m: Record<string, string> = {
    BORRADOR: "Borrador",
    ENVIADA_A_COMPRAS: "Enviada a Compras",
    EN_COTIZACION: "En cotización",
    COMPARATIVA_LISTA: "Comparativa lista",
    ENVIADA_A_SOLICITANTE: "Esperando decisión",
    CERRADA_CON_DECISION: "Cerrada con decisión",
    CERRADA_SIN_DECISION: "Cerrada sin decisión",
    CANCELADA: "Cancelada",
  };
  return m[e] ?? e;
}

function toneDe(e: string): "blue" | "success" | "warning" | "gray" {
  if (e === "CERRADA_CON_DECISION") return "success";
  if (e === "CERRADA_SIN_DECISION" || e === "CANCELADA" || e === "BORRADOR") return "gray";
  if (e === "ENVIADA_A_SOLICITANTE") return "warning";
  return "blue";
}