import { test, expect } from "@playwright/test";

// Credenciales seed (scripts/seed-auth.mjs). La feature 005 (auth) exige sesión real
// en /admin, así que cada test inicia sesión como admin.
async function loginAdmin(page: import("@playwright/test").Page) {
  await page.goto("/login/admin");
  await page.getByPlaceholder("usuario@compras.bia.local").fill("admin@biafoods.co");
  await page.getByPlaceholder("••••••••").fill("AdminBIA2026!");
  await page.getByRole("button", { name: /Entrar al panel/ }).click();
  // Esperar el dashboard real (el middleware redirige tras login).
  await page.getByRole("heading", { name: "Panel de Trazabilidad" }).waitFor({ timeout: 20000 });
}

test.describe("Panel admin", () => {
  test("dashboard renderiza métricas, gráficos y tabla", async ({ page }) => {
    await loginAdmin(page);
    await page.goto("/admin", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { name: "Panel de Trazabilidad" })).toBeVisible();
    await expect(page.getByText("Conversión (Aceptación)")).toBeVisible();
    await expect(page.getByText("Tabla de Procesos")).toBeVisible();
  });

  test("ver detalle abre la trazabilidad con timeline", async ({ page }) => {
    await loginAdmin(page);
    await page.goto("/admin");
    await page.getByRole("link", { name: "Ver Detalle" }).first().click();
    await expect(page.getByRole("heading", { name: "Línea de tiempo (Trazabilidad)" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Contexto" })).toBeVisible();
  });

  test("páginas procesos, coordinadores, configuración y ajustes renderizan", async ({ page }) => {
    await loginAdmin(page);
    await page.goto("/admin/procesos");
    await expect(page.getByText("Procesos de Compras")).toBeVisible();

    await page.goto("/admin/coordinadores");
    await expect(page.getByText("Equipo de Coordinadores")).toBeVisible();
    await expect(page.getByText("Carla Ortega")).toBeVisible();

    await page.goto("/admin/configuracion");
    await expect(page.getByText("Ajustes Generales")).toBeVisible();

    await page.goto("/admin/ajustes");
    await expect(page.getByText("Ajustes de Perfil")).toBeVisible();
  });
});