import { notFound } from "next/navigation";
import { VistaPublica } from "@/components/publica/VistaPublica";
import { cotizacionesFixture, comparativaFixture } from "@/lib/fixtures";

export const metadata = {
  title: "Comparativa — Portal de Compras BIA",
};

export default async function ComparativaPublicaPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  // Por ahora un token de demo; en producción el token resuelve el link_publico en el servidor.
  if (token !== "demo-2026") notFound();

  const cotizaciones = cotizacionesFixture.s014 ?? [];
  const comparativa = comparativaFixture("s014");
  if (!comparativa) notFound();

  return (
    <div className="mx-auto max-w-[900px] px-8 py-10">
      <VistaPublica
        cotizaciones={cotizaciones}
        prosContras={comparativa.prosContras}
        recomendacion={comparativa.recomendacionComprador}
        advertenciaGeneral={comparativa.analysis?.advertenciaGeneral ?? null}
      />
    </div>
  );
}