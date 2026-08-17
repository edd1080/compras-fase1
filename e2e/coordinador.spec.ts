import { test, expect, request } from "@playwright/test";

// Credenciales seed (scripts/seed-auth.mjs). La feature 005 (auth) exige sesión real
// en /panel, así que este spec inicia sesión antes de navegar.
const BASE = process.env.E2E_BASE_URL ?? "http://localhost:3000";

async function loginCoordinador(page: import("@playwright/test").Page) {
  await page.goto("/login/coordinador");
  await page.getByPlaceholder("usuario@compras.bia.local").fill("coordinador@biafoods.co");
  await page.getByPlaceholder("••••••••").fill("Coordinador2026!");
  await page.getByRole("button", { name: /Entrar al panel/ }).click();
  await page.getByRole("heading", { name: "Panel de Compras" }).waitFor({ timeout: 20000 });
}

test.describe("Flujo coordinador", () => {
  test("detalle → 3 etapas con cotizaciones reales, bloqueo B3", async ({ page }) => {
    await loginCoordinador(page);

    const ctx = await request.newContext({ baseURL: BASE });

    // Crear solicitud
    const creada = await (await ctx.post("/api/solicitudes", { data: { titulo: "Detalle e2e", solicitanteEmail: "detalle@bia.hn", solicitanteNombre: "Det", areaSolicitante: "IT", descripcion: "test", categoria: "materia_prima" } })).json();
    const id = creada.id;

    // Transicionar a ENVIADA_A_COMPRAS (asigna coordinador)
    await ctx.patch(`/api/solicitudes/${id}/estado`, { data: { hacia: "ENVIADA_A_COMPRAS", actorTipo: "solicitante", actorIdentificador: "detalle@bia.hn" } });

    // Navegar al detalle real (sin cotizaciones pre-cargadas)
    await page.goto(`/panel/solicitud/${id}`);
    await expect(page.getByRole("heading", { name: "Detalle e2e" })).toBeVisible();

    // Etapa 07 — crear 2 cotizaciones manualmente desde la UI
    await expect(page.getByText("Todavía no hay cotizaciones")).toBeVisible();
    await page.getByRole("button", { name: "Agregar cotización manual" }).click();

    async function crearCotizacion(nombre: string, neto: string, isv: string, total: string, plazo: string, moneda: string) {
      await page.getByPlaceholder("Ej. Imprenta CostaPrint S. de R.L.").fill(nombre);
      await page.getByPlaceholder("0.00").first().fill(neto);
      await page.getByPlaceholder("0.00").nth(1).fill(isv);
      await page.getByPlaceholder("0.00").nth(2).fill(total);
      await page.getByPlaceholder("Ej. 12 días").fill(plazo);
      if (moneda === "USD") {
        await page.getByRole("combobox").selectOption("USD");
      }
      await page.getByRole("button", { name: "Guardar cotización" }).click();
      await page.getByRole("button", { name: "Agregar cotización manual" }).click();
    }

    await crearCotizacion("CostaPrint", "86", "12.9", "98.9", "12 días", "HNL");
    await expect(page.getByText("CostaPrint")).toBeVisible();
    await crearCotizacion("PlayaPromo", "31.5", "0", "31.5", "10 días", "USD");
    await expect(page.getByText("PlayaPromo")).toBeVisible();

    // Generar comparativa (con confirmación)
    const generar = page.getByRole("button", { name: "Generar comparativa" });
    await expect(generar).toBeEnabled();
    await generar.click();
    await expect(page.getByText("Generar comparativa?")).toBeVisible();
    await page.getByRole("button", { name: "Sí, generar" }).click();

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