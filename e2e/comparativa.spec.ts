import { test, expect } from "@playwright/test";

test.describe("Vista pública de comparativa", () => {
  test("token válido → decide con confirmación", async ({ page }) => {
    await page.goto("/comparativa/demo-2026");
    await expect(page.getByText("Enlace público · sin iniciar sesión")).toBeVisible();
    await expect(page.getByText("Recomendación de Compras")).toBeVisible();

    // Elegir primer proveedor
    await page.getByRole("button", { name: "Elegir esta opción" }).first().click();
    await expect(page.getByText("Confirmar selección")).toBeVisible();
    await page.getByRole("button", { name: "Confirmar", exact: true }).click();
    await expect(page.getByText(/Opción elegida/i).first()).toBeVisible({ timeout: 10000 });
  });

  test("ninguna me sirve notifica sin cerrar con decisión", async ({ page }) => {
    await page.goto("/comparativa/demo-2026");
    const btnNinguna = page.getByRole("button", { name: /Ninguna me sirve/ });
    await btnNinguna.click();
    await expect(page.getByText(/Se notificó a Compras/i)).toBeVisible();
  });

  test("token inválido → mensaje neutro", async ({ page }) => {
    await page.goto("/comparativa/tok-invalido");
    await expect(page.getByText(/no se pudo/i).or(page.getByText("404"))).toBeVisible();
  });
});