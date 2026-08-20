import { test, expect } from "@playwright/test";

const BASE = process.env.E2E_BASE_URL ?? "http://localhost:3000";

async function loginCoordinador(page: import("@playwright/test").Page) {
  await page.goto("/login/coordinador");
  await page.getByPlaceholder("usuario@compras.bia.local").fill("coordinador@biafoods.co");
  await page.getByPlaceholder("••••••••").fill("Coordinador2026!");
  await page.getByRole("button", { name: /Entrar al panel/ }).click();
  await page.getByRole("heading", { name: "Panel de Compras" }).waitFor({ timeout: 20000 });
}

// Crea una solicitud real, le carga 2 cotizaciones manuales, genera comparativa (fallback IA),
// la transiciona a ENVIADA_A_SOLICITANTE (lo que crea el link real con token) y devuelve el token.
async function sembrarSolicitudConEnlace(page: import("@playwright/test").Page): Promise<{ token: string }> {
  await loginCoordinador(page);

  // page.request hereda la cookie de sesión del navegador (rol coordinador).
  const api = page.request;
  const email = `token-e2e-${Date.now()}@bia.hn`;

  const creada = await (await api.post("/api/solicitudes", {
    data: {
      titulo: "Decisión e2e",
      solicitanteEmail: email,
      solicitanteNombre: "Decisor E2E",
      areaSolicitante: "IT",
      descripcion: "test",
      categoria: "materia_prima",
    },
  })).json();
  const solicitudId = creada.id;

  // Crear 2 cotizaciones manuales (coordinador autenticado)
  await api.post(`/api/solicitudes/${solicitudId}/cotizaciones`, {
    data: { proveedorNombre: "ProvUnico", formatoOriginal: "manual", valorNeto: 100, valorTotal: 112, plazoEntrega: "5 días" },
  });
  await api.post(`/api/solicitudes/${solicitudId}/cotizaciones`, {
    data: { proveedorNombre: "ProvDos", formatoOriginal: "manual", valorNeto: 90, valorTotal: 100, plazoEntrega: "8 días" },
  });

  // Generar comparativa (fallback determinístico si la IA no responde)
  await api.post(`/api/solicitudes/${solicitudId}/comparativa`);

  // Transicionar como coordinador: ENVIADA_A_COMPRAS → EN_COTIZACION → COMPARATIVA_LISTA → ENVIADA_A_SOLICITANTE
  await api.patch(`/api/solicitudes/${solicitudId}/estado`, { data: { hacia: "ENVIADA_A_COMPRAS", actorTipo: "solicitante", actorIdentificador: email } });
  await api.patch(`/api/solicitudes/${solicitudId}/estado`, { data: { hacia: "EN_COTIZACION", actorTipo: "coordinador" } });
  await api.patch(`/api/solicitudes/${solicitudId}/estado`, { data: { hacia: "COMPARATIVA_LISTA", actorTipo: "coordinador" } });
  const enviada = await (await api.patch(`/api/solicitudes/${solicitudId}/estado`, { data: { hacia: "ENVIADA_A_SOLICITANTE", actorTipo: "coordinador", nota: "Recomiendo ProvUnico" } })).json();

  if (!enviada.enlace?.token) {
    throw new Error("No se generó el link público real (token) al enviar");
  }
  return { token: enviada.enlace.token };
}

test.describe("Vista pública de comparativa", () => {
  test("token real → decide con confirmación y cierra la solicitud", async ({ page }) => {
    const { token } = await sembrarSolicitudConEnlace(page);
    await page.goto(`/comparativa/${token}`);
    await expect(page.getByText("Enlace público · sin iniciar sesión")).toBeVisible();
    await expect(page.getByText(/Opciones cotizadas/i)).toBeVisible();

    await page.getByRole("button", { name: "Elegir esta opción" }).first().click();
    await expect(page.getByText("Confirmar selección")).toBeVisible();
    await page.getByRole("button", { name: "Confirmar", exact: true }).click();
    await expect(page.getByText(/Opción elegida/i).first()).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(/Tu decisión fue registrada/i)).toBeVisible({ timeout: 10000 });
  });

  test("token real → ninguna sirve notifica sin cerrar con decisión", async ({ page }) => {
    const { token } = await sembrarSolicitudConEnlace(page);
    await page.goto(`/comparativa/${token}`);
    const btnNinguna = page.getByRole("button", { name: /Ninguna me sirve/ });
    await btnNinguna.click();
    await expect(page.getByText(/Se notificó a Compras/i)).toBeVisible();
  });

  test("token inválido → mensaje neutro", async ({ page }) => {
    await page.goto("/comparativa/tok-invalido");
    await expect(page.getByText(/no se pudo/i).or(page.getByText("404"))).toBeVisible();
  });
});