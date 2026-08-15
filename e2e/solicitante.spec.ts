import { test, expect } from "@playwright/test";

test.describe("Flujo solicitante", () => {
  test("P1: valida correo y bloquea continuar con correo inválido", async ({ page }) => {
    await page.goto("/");
    await page.getByPlaceholder("ejemplo@bia.com").fill("correo-invalido");
    await page.getByRole("button", { name: "Continuar" }).waitFor();
    const btn = page.getByRole("button", { name: "Continuar" });
    await expect(btn).toBeDisabled();
    // Dominio no institucional → advertencia
    await page.getByPlaceholder("ejemplo@bia.com").fill("juan@gmail.com");
    await expect(page.getByText(/no parece institucional/i)).toBeVisible();
  });

  test("P1→P6: completa el wizard de punta a punta y llega a confirmación", async ({ page }) => {
    test.setTimeout(120000);
    await page.goto("/");
    await page.getByPlaceholder("ejemplo@bia.com").fill("maria.reyes@bia.hn");
    await page.getByPlaceholder("Juan Pérez").fill("María Reyes");
    await page.getByPlaceholder("Marketing").fill("Marketing");
    await page.getByRole("button", { name: "Continuar" }).click();

    // P2 — captura
    await expect(page.getByText("¿Qué necesitás?")).toBeVisible();
    await page.getByLabel("Título de la solicitud").fill("Sombrillas brandeadas");
    await page.locator('input[type="date"]').fill("2026-09-30");
    await page.locator("select").selectOption({ label: "Empaque y branding" });
    await page.getByRole("button", { name: "Continuar" }).click();

    // P3 — clasificación (la IA puede sugerir un tipo, o no si la confianza es baja)
    await expect(page.getByText(/Esto parece una|No pudimos determinar/i)).toBeVisible({ timeout: 15000 });
    // Si la IA no preseleccionó, el flujo igual continúa (el usuario puede corregir).
    const opcionRFQ = page.getByRole("radio", { name: /RFQ/ });
    if (await opcionRFQ.isEnabled().catch(() => false)) {
      const noSugerida = await page.getByText(/No pudimos determinar/i).isVisible().catch(() => false);
      if (noSugerida) {
        await opcionRFQ.check();
      }
    }
    await page.getByRole("button", { name: "Confirmar clasificación" }).click();

    // P4 — detalles
    await expect(page.getByText("Detalles para cotizar")).toBeVisible();
    // Branding activo sin logo → bloqueo B2
    const generador = page.getByRole("button", { name: "Generar documento" });
    await expect(generador).toBeDisabled();
    // Adjuntar logo (simulado)
    await page.getByText("Subir arte o logo oficial").click();
    await expect(generador).toBeEnabled();
    await generador.click();

    // P5 — documento
    await expect(page.getByText("Tu solicitud está lista")).toBeVisible();
    await page.getByRole("button", { name: "Enviar solicitud" }).click();

    // P6 — confirmación (puede tardar por pipeline PDF; tolerante a error de Resend en dev)
    await expect(page.getByText("Tu solicitud fue enviada")).toBeVisible({ timeout: 60000 });
  });
});