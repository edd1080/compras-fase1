import { Suspense } from "react";
import { SolicitanteWizard } from "@/components/solicitante/SolicitanteWizard";

export const metadata = {
  title: "Nueva solicitud — Portal de Compras BIA",
};

export default function NuevaSolicitudPage() {
  return (
    <div className="mx-auto max-w-[1160px] px-8">
      <div className="pt-8">
        <Suspense>
          <SolicitanteWizard />
        </Suspense>
      </div>
    </div>
  );
}