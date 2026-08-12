"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { Field } from "@/components/Field";
import Link from "next/link";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Home() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [nombre, setNombre] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [dominioAviso, setDominioAviso] = useState(false);

  const emailValido = EMAIL_RE.test(email.trim());

  function onContinuar() {
    if (!emailValido) {
      setError("Revisá el correo, parece que falta algo");
      return;
    }
    setError(null);
    // P1 → crea borrador (BORRADOR) y sigue al paso P2 (captura).
    // Por ahora, navega al wizard; la persistencia en cookie se hace en el hook.
    router.push(`/solicitud/nueva?email=${encodeURIComponent(email.trim())}&nombre=${encodeURIComponent(nombre.trim())}`);
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="w-full max-w-[640px]">
        <Card className="p-8">
          <h1 className="font-display text-[28px] font-semibold text-azul-marino">
            Solicitar una compra
          </h1>
          <p className="mt-3 text-[15px] text-texto-secundario">
            Contanos qué necesitás y lo enviamos al equipo de Compras.
          </p>

          <form
            className="mt-6"
            onSubmit={(e) => {
              e.preventDefault();
              onContinuar();
            }}
          >
            <Field label="Tu correo institucional" required error={error ?? undefined}>
              {({ id, ...aria }) => (
                <input
                  id={id}
                  type="email"
                  autoFocus
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setDominioAviso(false);
                    setError(null);
                  }}
                  onBlur={() => {
                    setDominioAviso(
                      emailValido && !/@bia\.hn$/.test(email.trim().toLowerCase())
                    );
                  }}
                  placeholder="maria.reyes@bia.hn"
                  className="w-full rounded-field border-[1.5px] border-borde-fuerte bg-fondo px-3.5 py-3 text-[14.5px] focus:border-azul-medio focus:bg-superficie focus:outline-none"
                  {...aria}
                />
              )}
            </Field>
            <Field label="Tu nombre completo" required className="mt-5">
              {({ id, ...aria }) => (
                <input
                  id={id}
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="María Reyes"
                  className="w-full rounded-field border-[1.5px] border-borde-fuerte bg-fondo px-3.5 py-3 text-[14.5px] focus:border-azul-medio focus:bg-superficie focus:outline-none"
                  {...aria}
                />
              )}
            </Field>

            {dominioAviso ? (
              <p className="mt-3 rounded-field border-l-4 border-advertencia bg-advertencia-fondo px-3 py-2 text-[13px] text-texto-principal">
                Este correo no parece institucional. Podés continuar, pero Compras lo va a
                revisar.
              </p>
            ) : null}

            <div className="mt-6 flex items-center justify-between gap-3">
              <Button
                type="submit"
                disabled={!emailValido}
                className="flex-1"
              >
                Continuar
              </Button>
            </div>
          </form>

          <div className="mt-6">
            <Link
              href="/mis-solicitudes"
              className="text-[13.5px] font-medium text-azul-medio hover:underline"
            >
              Ver mis solicitudes
            </Link>
          </div>
        </Card>
        <p className="mt-4 text-center text-[13px] text-texto-terciario">
          No necesitás crear cuenta ni contraseña.
        </p>
      </div>
    </main>
  );
}