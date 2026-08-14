#!/usr/bin/env node
// Seed de usuarios en Supabase Auth — Portal de Compras BIA.
// Crea/actualiza los usuarios iniciales en Supabase Auth con su rol en app_metadata.
// Requiere SUPABASE_SERVICE_ROLE_KEY (rol de servicio) y SUPABASE_URL en .env.local.
//
// Uso: node scripts/seed-auth.mjs
//
// NOTA: si ya creaste las cuentas manualmente desde el dashboard de Supabase,
// puedes omitir este script. Solo asegúrate de que cada usuario tenga asignado
// en "App Metadata" -> rol = "coordinador" o "admin".

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Cargar .env.local si existe (para variables de entorno locales).
try {
  const envFile = path.resolve(__dirname, "../.env.local");
  const contents = readFileSync(envFile, "utf8");
  for (const line of contents.split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)=(.*)$/);
    if (m && !process.env[m[1]]) {
      process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
    }
  }
} catch {
  /* sin .env.local */
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRole) {
  console.error("ERROR: faltan NEXT_PUBLIC_SUPABASE_URL y/o SUPABASE_SERVICE_ROLE_KEY en .env.local");
  process.exit(1);
}

const admin = createClient(supabaseUrl, serviceRole, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// Mismos usuarios que migrations/006_configuracion_seed.sql
const USUARIOS = [
  { email: "coordinador1@compras.bia.local", password: "Coordinador1!", rol: "coordinador", nombre: "Coordinador 1" },
  { email: "coordinador2@compras.bia.local", password: "Coordinador2!", rol: "coordinador", nombre: "Coordinador 2" },
  { email: "coordinador3@compras.bia.local", password: "Coordinador3!", rol: "coordinador", nombre: "Coordinador 3" },
  { email: "coordinador4@compras.bia.local", password: "Coordinador4!", rol: "coordinador", nombre: "Coordinador 4" },
  { email: "lady.matute@compras.bia.local", password: "AdminBIA2026!", rol: "admin", nombre: "Lady Matute" },
];

for (const u of USUARIOS) {
  // Intentar actualizar si existe; si no, crear.
  const { data: existing } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
  const found = existing?.users?.find((x) => x.email === u.email);

  if (found) {
    const { error } = await admin.auth.admin.updateUserById(found.id, {
      user_metadata: { nombre: u.nombre },
      app_metadata: { rol: u.rol },
    });
    if (error) {
      console.error(`[actualizar] ${u.email}:`, error.message);
    } else {
      console.log(`[actualizado rol] ${u.email} -> ${u.rol}`);
    }
  } else {
    const { error } = await admin.auth.admin.createUser({
      email: u.email,
      password: u.password,
      email_confirm: true,
      user_metadata: { nombre: u.nombre },
      app_metadata: { rol: u.rol },
    });
    if (error) {
      console.error(`[crear] ${u.email}:`, error.message);
    } else {
      console.log(`[creado] ${u.email} -> ${u.rol}`);
    }
  }
}

console.log("Seed de usuarios completado.");
