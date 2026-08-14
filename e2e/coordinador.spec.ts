import { test, expect, request } from "@playwright/test";

test.describe("Flujo coordinador", () => {
  test("detalle → 3 etapas con cotizaciones reales, bloqueo B3", async ({ page }) => {
    const ctx = await request.newContext({ baseURL: "http://localhost:3000" });

    // Crear solicitud
    const creada = await (await ctx.post("/api/solicitudes", { data: { titulo: "Detalle e2e", solicitanteEmail: "detalle@bia.hn", solicitanteNombre: "Det", areaSolicitante: "IT", descripcion: "test", categoria: "materia_prima" } })).json();
    const id = creada.id;

    // Transicionar a ENVIADA_A_COMPRAS (asigna coordinador u1)
    await ctx.patch(`/api/solicitudes/${id}/estado`, { data: { hacia: "ENVIADA_A_COMPRAS", actorTipo: "solicitante", actorIdentificador: "detalle@bia.hn" } });

    // Cargar 2 cotizaciones
    await ctx.post(`/api/solicitudes/${id}/cotizaciones`, { data: { proveedorNombre: "CostaPrint", formatoOriginal: "pdf", valorNeto: 86000, moneda: "HNL", impuestosDesglosados: true, montoIsv: 12900, valorTotal: 98900, plazoEntrega: "12 días" } });
    await ctx.post(`/api/solicitudes/${id}/cotizaciones`, { data: { proveedorNombre: "PlayaPromo", formatoOriginal: "docx", valorNeto: 3150, moneda: "USD", impuestosDesglosados: false, valorTotal: 3150, plazoEntrega: "10 días" } });

    // Navegar al detalle real
    await page.goto(`/panel/solicitud/${id}`);
    await expect(page.getByRole("heading", { name: "Detalle e2e" })).toBeVisible();

    // Etapa 07 — cotizaciones (2 reales cargadas)
    await expect(page.getByText("07 · Carga cotizaciones")).toBeVisible();
    const generar = page.getByRole("button", { name: "Generar comparativa" });
    await expect(generar).toBeEnabled();
    await generar.click();

    // Etapa 08 — comparativa
    await expect(page.getByText("08 · Comparativa generada")).toBeVisible();
    await expect(page.getByText("Valor neto")).toBeVisible();
    await page.getByRole("button", { name: /Ver recomendación/ }).click();

    // Etapa 09 — recomendación con B3
    await expect(page.getByRole("heading", { name: "09 · Recomendación" })).toBeVisible();
    const enviar = page.getByRole("button", { name: "Enviar comparativa al solicitante" });
    await expect(enviar).toBeDisabled();
    await page.getByPlaceholder(/Escribí tu criterio/).fill("Recomiendo PlayaPromo");
    await expect(enviar).toBeEnabled();
    await enviar.click();

    // Vista de envío
    await expect(page.getByText("ENVIADA_A_SOLICITANTE", { exact: true })).toBeVisible({ timeout: 15000 });
    await expect(page.getByRole("button", { name: /copiar/i })).toBeVisible();
  });

  test("bandeja muestra solicitudes reales del coordinador", async ({ page }) => {
    await page.goto("/panel");
    await expect(page.getByRole("heading", { name: "Panel de Compras" })).toBeVisible();
    await expect(page.getByText("Activas").first()).toBeVisible();
  });
});