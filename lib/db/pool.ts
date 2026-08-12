// Cliente PostgreSQL local — Portal de Compras BIA
// La capa de acceso a datos es abstracta (puerto Repositorio + adaptador).
// Este adaptador usa `pg` contra DATABASE_URL; cambiar a Supabase = adaptador nuevo + URL.
import { Pool } from "pg";

const DATABASE_URL = process.env.DATABASE_URL ?? "";

export function crearPool(): Pool {
  if (!DATABASE_URL) {
    throw new Error(
      "Falta DATABASE_URL (ver .env.example). La capa de datos requiere la base de desarrollo."
    );
  }
  return new Pool({ connectionString: DATABASE_URL });
}

export const pool = () => {
  const Holder = globalThis as unknown as { __biaPool?: Pool };
  if (!Holder.__biaPool) {
    Holder.__biaPool = crearPool();
  }
  return Holder.__biaPool;
};