import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SolicitanteWizard } from "./SolicitanteWizard";

vi.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams("email=maria.reyes@bia.hn&nombre=Maria+Reyes"),
}));

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

describe("SolicitanteWizard", () => {
  it("muestra el paso de captura inicial (P2) al inicio", () => {
    render(<SolicitanteWizard />);
    expect(screen.getByText("Título de la solicitud")).toBeInTheDocument();
  });

  it("habilita Continuar solo cuando el paso es válido", async () => {
    const user = userEvent.setup();
    render(<SolicitanteWizard />);
    const continuar = screen.getByRole("button", { name: "Continuar" });
    expect(continuar).toBeDisabled();
    await user.type(screen.getByLabelText(/título de la solicitud/i), "Sombrillas");
    await user.type(screen.getByLabelText(/área/i), "Trade Marketing");
    // fecha requerida + tipo de necesidad aún vacíos → sigue deshabilitado
    expect(continuar).toBeDisabled();
  });
});