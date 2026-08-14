// Explorador visual QA: recorre todas las rutas reales, captura errores de consola/red
// y guarda un reporte. Usa la DB real (datos de prueba) — no fixtures.
import { test, expect } from "@playwright/test";
import { writeFileSync, mkdirSync } from "node:fs";

const BASE = "http://localhost:3000";
const REPORTE_DIR = "qa";
const REPORTE = `${REPORTE_DIR}/report-explorador.md`;

const rutas = [
  { path: "/", rol: "solicitante" },
  { path: "/solicitud/nueva", rol: "solicitante" },
  { path: "/mis-solicitudes", rol: "solicitante" },
  { path: "/panel", rol: "coordinador" },
  { path: "/comparativa/demo-2026", rol: "publico" },
  { path: "/admin", rol: "admin" },
  { path: "/admin/procesos", rol: "admin" },
  { path: "/admin/coordinadores", rol: "admin" },
  { path: "/admin/configuracion", rol: "admin" },
  { path: "/admin/ajustes", rol: "admin" },
];

test.describe("Explorador visual — todas las rutas contra DB real", () => {
  const errores: { ruta: string; tipo: string; mensaje: string }[] = [];
  const okFlujos: string[] = [];

  for (const r of rutas) {
    test(`${r.rol}: ${r.path} carga sin errores de consola/red`, async ({ page }) => {
      page.on("console", (msg) => {
        if (msg.type() === "error") errores.push({ ruta: r.path, tipo: "console", mensaje: msg.text() });
      });
      page.on("response", (res) => {
        if (res.status() >= 400 && !res.url().includes("_next")) {
          errores.push({ ruta: r.path, tipo: `http-${res.status()}`, mensaje: res.url() });
        }
      });

      const res = await page.goto(`${BASE}${r.path}`);
      await page.waitForLoadState("domcontentloaded");
      expect(res?.status()).toBeLessThan(400);

      // Error de consola = fallo
      if (errores.filter((e) => e.ruta === r.path && e.tipo === "console").length > 0) {
        throw new Error(`Error de consola en ${r.path}`);
      }
      okFlujos.push(`${r.rol}: ${r.path}`);
    });
  }

  test.afterAll(async () => {
    mkdirSync(REPORTE_DIR, { recursive: true });
    const md = [
      "# Reporte Explorador Visual QA",
      "",
      `Fecha: ${new Date().toISOString()}`,
      "",
      "## Errores detectados (consola / red / HTTP >= 400)",
      errores.length === 0 ? "- Ninguno" : "",
      ...errores.map((e) => `- **${e.ruta}** [${e.tipo}]: ${e.mensaje}`),
      "",
      "## Rutas que cargaron OK",
      ...okFlujos.map((f) => `- ${f}`),
      "",
    ].filter((l) => l !== undefined).join("\n");
    writeFileSync(REPORTE, md);
  });
});