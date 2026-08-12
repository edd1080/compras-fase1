"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useMemo } from "react";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { Field } from "@/components/Field";
import { Stepper } from "@/components/ui-ext/Stepper";
import { Segmented } from "@/components/ui-ext/Segmented";
import { ChipGroup } from "@/components/ui-ext/Chip";
import { Switch } from "@/components/ui-ext/Switch";
import { useSolicitudWizard } from "@/hooks/useSolicitudWizard";

const TIPOS_NECESIDAD = [
  "Empaque y branding",
  "Materia prima",
  "Servicios logísticos",
  "Administrativo",
  "Proyecto o CAPEX",
  "Otro",
];

const OPCIONES_CLASIFICACION = [
  { value: "RFI" as const, label: "RFI", detail: "Todavía explorando opciones" },
  { value: "RFQ" as const, label: "RFQ", detail: "Ya sé qué necesito, falta precio" },
  { value: "RFP" as const, label: "RFP", detail: "Proyecto o solución más amplia" },
];

export function SolicitanteWizard() {
  const searchParams = useSearchParams();
  const emailInicial = searchParams.get("email") ?? "";
  const nombreInicial = searchParams.get("nombre") ?? "";

  const w = useSolicitudWizard();
  const { estado, set, siguiente, anterior, irA, pasoValido, envio, enviarSolicitud } = w;

  useEffect(() => {
    if (emailInicial) set("email", emailInicial);
    if (nombreInicial) set("nombre", nombreInicial);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [emailInicial, nombreInicial]);

  const pasosStepper = useMemo(() => {
    const estadoPaso = (n: number): "done" | "current" | "pending" =>
      estado.paso > n ? "done" : estado.paso === n ? "current" : "pending";
    return [
      { numero: 3, label: "Clasificación", estado: estadoPaso(3), onNavigate: () => irA(3) },
      { numero: 4, label: "Detalles", estado: estadoPaso(4), onNavigate: () => irA(4) },
      { numero: 5, label: "Documento", estado: estadoPaso(5), onNavigate: () => irA(5) },
      { numero: 6, label: "Confirmación", estado: estadoPaso(6) },
    ];
  }, [estado.paso, irA]);

  return (
    <div className="max-w-[640px] py-8">
      <Stepper pasos={pasosStepper} className="mb-7" />

      {estado.paso === 2 ? (
        <Card className="p-8">
          <Field label="Título de la solicitud" required>
            {({ id, ...aria }) => (
              <input
                id={id}
                value={estado.titulo}
                onChange={(e) => set("titulo", e.target.value)}
                placeholder="Sombrillas brandeadas — activación Café Oro playa"
                className="w-full rounded-field border-[1.5px] border-borde-fuerte bg-fondo px-3.5 py-3 text-[14.5px] focus:border-azul-medio focus:bg-superficie focus:outline-none"
                {...aria}
              />
            )}
          </Field>
          <Field label="¿Qué tipo de necesidad es?" required className="mt-5">
            {({ id, ...aria }) => (
              <select
                id={id}
                value={estado.tipoNecesidad}
                onChange={(e) => set("tipoNecesidad", e.target.value)}
                className="w-full rounded-field border-[1.5px] border-borde-fuerte bg-fondo px-3.5 py-3 text-[14.5px] focus:border-azul-medio focus:bg-superficie focus:outline-none"
                {...aria}
              >
                <option value="">Seleccioná una opción</option>
                {TIPOS_NECESIDAD.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            )}
          </Field>
          <Field label="¿Es un producto o un servicio?" className="mt-5">
            {() => (
              <Segmented
                options={[
                  { value: "producto" as const, label: "Producto" },
                  { value: "servicio" as const, label: "Servicio" },
                ]}
                value={estado.subtipo}
                onChange={(v) => set("subtipo", v)}
              />
            )}
          </Field>
          <Field label="¿Para cuándo lo necesitas?" required className="mt-5">
            {({ id, ...aria }) => (
              <input
                id={id}
                type="date"
                value={estado.fechaRequerida}
                onChange={(e) => set("fechaRequerida", e.target.value)}
                className="w-full rounded-field border-[1.5px] border-borde-fuerte bg-fondo px-3.5 py-3 text-[14.5px] focus:border-azul-medio focus:bg-superficie focus:outline-none"
                {...aria}
              />
            )}
          </Field>
          <Field label="Área / departamento" required className="mt-5">
            {({ id, ...aria }) => (
              <input
                id={id}
                value={estado.area}
                onChange={(e) => set("area", e.target.value)}
                placeholder="Trade Marketing"
                className="w-full rounded-field border-[1.5px] border-borde-fuerte bg-fondo px-3.5 py-3 text-[14.5px] focus:border-azul-medio focus:bg-superficie focus:outline-none"
                {...aria}
              />
            )}
          </Field>
          <Field label="Descripción breve" required className="mt-5">
            {({ id, ...aria }) => (
              <textarea
                id={id}
                value={estado.descripcion}
                onChange={(e) => set("descripcion", e.target.value)}
                className="min-h-[90px] w-full resize-y rounded-field border-[1.5px] border-borde-fuerte bg-fondo px-3.5 py-3 text-[14.5px] focus:border-azul-medio focus:bg-superficie focus:outline-none"
                {...aria}
              />
            )}
          </Field>
        </Card>
      ) : estado.paso === 3 ? (
        <Card className="p-8">
          <span className="mb-3 inline-flex rounded-full bg-azul-claro px-2.5 py-1 text-[11.5px] font-mono text-azul-medio">
            Alta confianza
          </span>
          <h2 className="font-display text-[20px] font-semibold">
            Esto parece una <span className="text-azul-marino">{estado.clasificacion}</span>
          </h2>
          <p className="mt-2 text-[13.5px] leading-relaxed text-texto-secundario">
            {estado.clasificacion === "RFQ"
              ? "Ya sabés exactamente qué necesitás — solo falta cotizar el precio con proveedores."
              : estado.clasificacion === "RFI"
                ? "Aún estás explorando opciones de mercado."
                : "Necesitás una solución o proyecto más amplio."}
          </p>
          <p className="mb-3 mt-5 text-[12.5px] font-semibold text-texto-secundario">
            ¿No es correcto? Elegí otra opción — no pasa nada si no es perfecto.
          </p>
          <ChipGroup
            options={OPCIONES_CLASIFICACION}
            value={estado.clasificacion}
            onChange={(v) => {
              set("clasificacion", v);
              set("clasificacionCorregida", v !== "RFQ");
            }}
          />
        </Card>
      ) : estado.paso === 4 ? (
        <Card className="p-8">
          <div id="assess" className="mb-5 flex items-center gap-2.5 text-[13.5px] text-texto-secundario">
            {!estado.assessmentListo ? (
              <>
                <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-borde-fuerte border-t-azul-medio" />
                Revisando referencias de mercado para {estado.titulo || "tu pedido"}…
              </>
            ) : (
              <span>Para que los proveedores coticen bien, necesitamos un poco más de detalle.</span>
            )}
          </div>

          {estado.assessmentListo ? (
            <div>
              <Field label="Dimensiones">
                {({ id, ...aria }) => (
                  <input
                    id={id}
                    className="w-full rounded-field border-[1.5px] border-borde-fuerte bg-fondo px-3.5 py-3 text-[14.5px] focus:border-azul-medio focus:bg-superficie focus:outline-none"
                    placeholder="2.0 m de diámetro, mástil de madera"
                    {...aria}
                  />
                )}
              </Field>
              <Field label="Materiales" className="mt-5">
                {({ id, ...aria }) => (
                  <input
                    id={id}
                    className="w-full rounded-field border-[1.5px] border-borde-fuerte bg-fondo px-3.5 py-3 text-[14.5px] focus:border-azul-medio focus:bg-superficie focus:outline-none"
                    placeholder="Poliéster resistente a UV"
                    {...aria}
                  />
                )}
              </Field>
              <Field label="Calidad esperada" className="mt-5">
                {({ id, ...aria }) => (
                  <select
                    id={id}
                    className="w-full rounded-field border-[1.5px] border-borde-fuerte bg-fondo px-3.5 py-3 text-[14.5px] focus:border-azul-medio focus:bg-superficie focus:outline-none"
                    {...aria}
                  >
                    <option>Premium — uso exterior prolongado</option>
                    <option>Estándar</option>
                  </select>
                )}
              </Field>

              <div className="mt-5">
                <Switch
                  label="¿Lleva logo o branding?"
                  hint="Si es así, el logo correcto es obligatorio antes de continuar."
                  checked={estado.llevaBranding}
                  onChange={(v) => set("llevaBranding", v)}
                />
              </div>

              {estado.llevaBranding ? (
                <div className="mt-5">
                  <label className="mb-2 block text-[12.5px] font-semibold text-texto-secundario">
                    Logo correcto <span className="text-clay">(obligatorio — B2)</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => set("archivoLogo", "logo_cafeoro.svg")}
                    className="w-full rounded-field border-[1.5px] border-dashed border-borde-fuerte bg-fondo px-4 py-3 text-left text-[13.5px] text-texto-secundario hover:border-azul-medio hover:bg-azul-claro"
                  >
                    {estado.archivoLogo
                      ? `✓ ${estado.archivoLogo} adjuntado`
                      : "📎 Adjuntar archivo del logo"}
                  </button>
                  <p className="mt-1.5 text-[12px] text-texto-terciario">
                    Así evitamos repetir el caso donde se produjeron gorras con el logo anterior.
                  </p>
                </div>
              ) : null}
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setTimeout(() => set("assessmentListo", true), 900)}
              className="text-[12.5px] text-slate underline decoration-dotted hover:text-azul-marino"
            >
              Continuar con la plantilla base
            </button>
          )}
        </Card>
      ) : estado.paso === 5 ? (
        <DocumentoGenerado titulo={estado.titulo} nivelReferencia="RFQ-2026-014" />
      ) : (
        <EnviadoACompras email={estado.email} nombre={estado.nombre} />
      )}

      <div className="mt-8 flex max-w-[640px] gap-3">
        <Button variant="ghost" onClick={anterior} disabled={estado.paso === 2} className="flex-none">
          Atrás
        </Button>
        {estado.paso < 6 ? (
          <Button
            onClick={estado.paso === 5 ? () => enviarSolicitud() : siguiente}
            disabled={!pasoValido || envio.estado === "enviando"}
            className="flex-1"
          >
            {estado.paso === 5
              ? envio.estado === "enviando"
                ? "Enviando…"
                : "Enviar solicitud"
              : "Continuar"}
          </Button>
        ) : null}
      </div>

      {envio.estado === "error" ? (
        <p role="alert" className="mt-4 max-w-[640px] text-[13px] text-error">
          {envio.mensaje}
        </p>
      ) : null}
    </div>
  );
}

function DocumentoGenerado({ titulo, nivelReferencia }: { titulo: string; nivelReferencia: string }) {
  return (
    <div>
      <p className="mb-5 max-w-[520px] text-[13.5px] text-texto-secundario">
        Tu documento está listo, con número de referencia único para dar seguimiento.
      </p>
      <div className="relative max-w-[420px] rounded-card border-[1.5px] border-borde-fuerte bg-superficie px-7 py-6 shadow-card">
        <div className="mb-4 flex items-start justify-between border-b border-dashed border-borde-fuerte pb-3.5">
          <div className="font-display text-[14px] font-bold">
            BIA <span className="text-brass-dark">Honduras</span>
          </div>
          <span className="inline-flex rounded-full bg-brass-soft px-2 py-1 text-[11px] font-semibold text-brass-dark">
            RFQ
          </span>
        </div>
        <div className="font-mono text-[19px] font-medium">{nivelReferencia}</div>
        <div className="mt-4 flex flex-col gap-2.5 text-[13px]">
          <Row k="Producto" v={titulo || "—"} />
          <Row k="Solicitante" v="María Reyes" />
        </div>
        <span className="absolute bottom-5 right-6 rotate-[-9deg] rounded-[6px] border-2 border-brass px-3 py-1.5 font-display text-[11.5px] font-bold uppercase tracking-[0.06em] text-brass-dark">
          Generado
        </span>
      </div>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-3">
      <span className="text-slate">{k}</span>
      <span className="text-right font-semibold">{v}</span>
    </div>
  );
}

function EnviadoACompras({ email, nombre }: { email: string; nombre: string }) {
  return (
    <Card className="p-8">
      <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-sage-soft">
        <svg viewBox="0 0 24 24" className="h-6 w-6 text-sage">
          <path d="M4 12l6 6L20 6" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <h2 className="font-display text-[20px] font-semibold">
        Tu solicitud fue enviada a Compras
      </h2>
      <p className="mt-2 text-[13.5px] text-texto-secundario">
        Te avisaremos a <b className="font-mono text-ink">{email || "tu correo"}</b> en cuanto haya
        una comparativa lista. Podés cerrar esta ventana.
      </p>
      <div className="mt-5 flex items-center gap-3.5 rounded-card border border-borde bg-fondo px-4 py-4">
        <span className="flex h-[42px] w-[42px] items-center justify-center rounded-full bg-azul-marino font-display font-semibold text-white">
          {nombre ? iniciales(nombre) : "CM"}
        </span>
        <div>
          <div className="text-[14px] font-semibold">{nombre ? "Equipo de Compras" : "Carlos Mejía"}</div>
          <div className="text-[12.5px] text-slate">Coordinador de Compras asignado</div>
        </div>
      </div>
    </Card>
  );
}

function iniciales(nombre: string): string {
  return nombre.split(/\s+/).slice(0, 2).map((p) => p[0]?.toUpperCase() ?? "").join("");
}