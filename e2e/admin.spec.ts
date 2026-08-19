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

  test("catálogo: crea un campo y lo desactiva (T014)", async ({ page }) => {
    await loginAdmin(page);
    await page.goto("/admin/campos");
    await expect(page.getByRole("heading", { name: "Catálogo de campos" })).toBeVisible();

    await page.getByRole("button", { name: "Nuevo campo" }).click();
    await page.getByRole("textbox", { name: "Clave interna" }).fill("test_e2e_campo");
    await page.getByRole("textbox", { name: "Etiqueta (visible al usuario)" }).fill("Campo de prueba e2e");
    await page.getByRole("button", { name: "Guardar campo" }).click();

    await expect(page.getByText("Campo creado correctamente.")).toBeVisible();
    await expect(page.getByText("test_e2e_campo")).toBeVisible();

    // Desactivar el campo creado.
    const fila = page.getByRole("row", { name: /test_e2e_campo/ });
    await fila.getByRole("button", { name: "Desactivar" }).click();
    await expect(page.getByText("test_e2e_campo")).toBeVisible();
  });
});