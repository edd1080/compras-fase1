import { test, expect, request } from "@playwright/test";

// Credenciales seed (scripts/seed-auth.mjs). La feature 005 (auth) exige sesión real
// en /panel, así que este spec inicia sesión antes de navegar.
async function loginCoordinador(page: import("@playwright/test").Page) {
  await page.goto("/login/coordinador");
  await page.getByPlaceholder("usuario@compras.bia.local").fill("coordinador@biafoods.co");
  await page.getByPlaceholder("••••••••").fill("Coordinador2026!");
  await page.getByRole("button", { name: /Entrar al panel/ }).click();
  await page.waitForURL("**/panel", { timeout: 15000 });
}

test.describe("Flujo coordinador", () => {
  test("detalle → 3 etapas con cotizaciones reales, bloqueo B3", async ({ page }) => {
    await loginCoordinador(page);

    const ctx = await request.newContext({ baseURL: "http://localhost:3000" });

    // Crear solicitud
    const creada = await (await ctx.post("/api/solicitudes", { data: { titulo: "Detalle e2e", solicitanteEmail: "detalle@bia.hn", solicitanteNombre: "Det", areaSolicitante: "IT", descripcion: "test", categoria: "materia_prima" } })).json();
    const id = creada.id;

    // Transicionar a ENVIADA_A_COMPRAS (asigna coordinador)
    await ctx.patch(`/api/solicitudes/${id}/estado`, { data: { hacia: "ENVIADA_A_COMPRAS", actorTipo: "solicitante", actorIdentificador: "detalle@bia.hn" } });

    // Cargar 2 cotizaciones
    await ctx.post(`/api/solicitudes/${id}/cotizaciones`, { data: { proveedorNombre: "CostaPrint", formatoOriginal: "pdf", valorNeto: 86, moneda: "HNL", impuestosDesglosados: true, montoIsv: 12.9, valorTotal: 98.9, plazoEntrega: "12 días" } });
    await ctx.post(`/api/solicitudes/${id}/cotizaciones`, { data: { proveedorNombre: "PlayaPromo", formatoOriginal: "docx", valorNeto: 31.5, moneda: "USD", impuestosDesglosados: false, valorTotal: 31.5, plazoEntrega: "10 días" } });

    // Navegar al detalle real
    await page.goto(`/panel/solicitud/${id}`);
    await expect(page.getByRole("heading", { name: "Detalle e2e" })).toBeVisible();

    // Etapa 07 — cotizaciones (2 reales cargadas)
    await expect(page.getByText("07 · Carga cotizaciones")).toBeVisible();
    const generar = page.getByRole("button", { name: "Generar comparativa" });
    await expect(generar).toBeEnabled();
    await generar.click();

    // Etapa 08 — comparativa (puede tardar por la IA; tolerante)
    await expect(page.getByText("08 · Comparativa generada")).toBeVisible({ timeout: 30000 });
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
    await loginCoordinador(page);
    await page.goto("/panel");
    await expect(page.getByRole("heading", { name: "Panel de Compras" })).toBeVisible();
    await expect(page.getByText("Activas").first()).toBeVisible();
  });
});