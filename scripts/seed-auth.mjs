#!/usr/bin/env node
// Seed de usuarios en Supabase Auth — Portal de Compras BIA.
// Crea/actualiza los usuarios en Supabase Auth con su rol en app_metadata.
// Requiere NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY en .env.local.
//
// Uso: node scripts/seed-auth.mjs

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Cargar .env.local si existe.
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

// Cuentas oficiales de la plataforma (dominio @biafoods.co).
const USUARIOS = [
  { email: "admin@biafoods.co", password: "AdminBIA2026!", rol: "admin", nombre: "Admin BIA" },
  { email: "coordinador@biafoods.co", password: "Coordinador2026!", rol: "coordinador", nombre: "Coordinador BIA" },
];

for (const u of USUARIOS) {
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
console.log("Cuentas: admin@biafoods.co (admin) · coordinador@biafoods.co (coordinador)");
