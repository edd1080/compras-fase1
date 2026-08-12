import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { Badge } from "@/components/Badge";
import { Alert } from "@/components/Alert";

describe("Button", () => {
  it("renderiza con variante primaria por defecto", () => {
    render(<Button>Continuar</Button>);
    const button = screen.getByRole("button", { name: "Continuar" });
    expect(button).toHaveClass("bg-azul-marino");
  });

  it("se deshabilita y usa la variante disabled", () => {
    render(<Button disabled>Enviar</Button>);
    const button = screen.getByRole("button", { name: "Enviar" });
    expect(button).toBeDisabled();
    expect(button).toHaveClass("cursor-not-allowed");
  });
});

describe("Card", () => {
  it("renderiza su contenido", () => {
    render(<Card>Contenido</Card>);
    expect(screen.getByText("Contenido")).toBeInTheDocument();
  });
});

describe("Badge", () => {
  it("muestra la etiqueta", () => {
    render(<Badge label="Borrador" />);
    expect(screen.getByText("Borrador")).toBeInTheDocument();
  });
});

describe("Alert", () => {
  it("muestra título y cuerpo", () => {
    render(<Alert variant="warning" title="Plazo corto">Revisá la fecha</Alert>);
    expect(screen.getByText("Plazo corto")).toBeInTheDocument();
    expect(screen.getByText("Revisá la fecha")).toBeInTheDocument();
  });

  it("usa role alert en variante error", () => {
    render(<Alert variant="error">Fallo</Alert>);
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });
});
