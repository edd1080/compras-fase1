import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="w-full max-w-[640px] rounded-card border border-borde bg-surface p-8 text-center shadow-sm">
        <h1 className="font-display text-[28px] font-semibold leading-tight text-azul-marino">
          Solicitar una compra
        </h1>
        <p className="mt-3 text-[15px] text-texto-secundario">
          Contanos qué necesitás y lo enviamos al equipo de Compras.
        </p>
        <Link
          href="#"
          className="mt-6 inline-flex min-h-[44px] items-center justify-center rounded-field bg-azul-marino px-6 text-[15px] font-medium text-white hover:bg-azul-medio"
        >
          Continuar
        </Link>
        <p className="mt-4 text-[13px] text-texto-terciario">
          No necesitás crear cuenta ni contraseña.
        </p>
      </div>
    </main>
  );
}
