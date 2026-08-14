import { test, expect } from "@playwright/test";

test.describe("Panel admin", () => {
  test("dashboard renderiza métricas, gráficos y tabla", async ({ page }) => {
    await page.goto("/admin");
    await expect(page.getByRole("heading", { name: "Panel de Trazabilidad" })).toBeVisible();
    await expect(page.getByText("Conversión (Aceptación)")).toBeVisible();
    await expect(page.getByText("Tabla de Procesos")).toBeVisible();
  });

  test("ver detalle abre la trazabilidad con timeline", async ({ page }) => {
    await page.goto("/admin");
    await page.getByRole("link", { name: "Ver Detalle" }).first().click();
    await expect(page.getByRole("heading", { name: "Línea de tiempo (Trazabilidad)" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Contexto" })).toBeVisible();
  });

  test("páginas procesos, coordinadores, configuración y ajustes renderizan", async ({ page }) => {
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