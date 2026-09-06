#!/usr/bin/env node
// Carga el equipo real de Compras en Supabase Auth (confirmado, sin correo de invitación).
// Las cuentas se crean con contraseña temporal aleatoria; las contraseñas se imprimen una vez
// y se guardan en un archivo local protegido para repartirlas en el arranque del piloto.
//
// Uso: node scripts/cargar-equipo-auth.mjs
import { createClient } from "@supabase/supabase-js";
import { readFileSync, writeFileSync } from "node:fs";
import { randomBytes } from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";
import process from "node:process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

try {
  const envFile = path.resolve(__dirname, "../.env.local");
  const contents = readFileSync(envFile, "utf8");
  for (const line of contents.split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)=(.*)$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
} catch { /* sin .env.local */ }

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!supabaseUrl || !serviceRole) {
  console.error("ERROR: faltan NEXT_PUBLIC_SUPABASE_URL y/o SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const admin = createClient(supabaseUrl, serviceRole, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const EQUIPO = [
  { nombre: "Ladi Isabel Matute", email: "lmatute@biabrands.co", rol: "admin" },
  { nombre: "Bryan Bonilla", email: "bbonilla@biabrands.co", rol: "coordinador" },
  { nombre: "Carlos Melara", email: "cmelara@biabrands.co", rol: "coordinador" },
  { nombre: "Lester Ramirez", email: "lramirez@biabrands.co", rol: "coordinador" },
  { nombre: "Maria Jose Torres", email: "mjtorres@biabrands.co", rol: "coordinador" },
];

function tempPassword() {
  // 12 chars, sin caracteres ambiguos (1/l/I/O/0).
  const alphabet = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789";
  const bytes = randomBytes(12);
  let out = "";
  for (let i = 0; i < 12; i++) out += alphabet[bytes[i] % alphabet.length];
  return out + "!";
}

const resLista = await admin.auth.admin.listUsers();
if (resLista.error) { console.error("ERROR listando usuarios:", resLista.error.message); process.exit(1); }
const lista = resLista.data;
const existentes = new Set(lista.users.map((u) => u.email));

const resultados = [];
const credenciales = [];

for (const p of EQUIPO) {
  const pass = tempPassword();
  if (existentes.has(p.email)) {
    const usuario = lista.users.find((u) => u.email === p.email);
    const { error } = await admin.auth.admin.updateUserById(usuario.id, {
      user_metadata: { nombre: p.nombre },
      app_metadata: { rol: p.rol },
    });
    if (error) { resultados.push({ email: p.email, ok: false, detalle: error.message }); continue; }
    resultados.push({ email: p.email, ok: true, detalle: "ya existia, rol actualizado" });
    continue;
  }
  const resCrea = await admin.auth.admin.createUser({
    email: p.email,
    password: pass,
    email_confirm: true,
    user_metadata: { nombre: p.nombre },
    app_metadata: { rol: p.rol },
  });
  if (resCrea.error) { resultados.push({ email: p.email, ok: false, detalle: resCrea.error.message }); continue; }
  credenciales.push({ nombre: p.nombre, email: p.email, rol: p.rol, password: pass });
  resultados.push({ email: p.email, ok: true, detalle: "creado (confirmado, sin invitacion)" });
}

for (const r of resultados) console.log(`[${r.ok ? "OK" : "ERR"}] ${r.email} — ${r.detalle}`);

if (credenciales.length) {
  const outPath = "/tmp/credenciales-piloto-bia.txt";
  const cuerpo = credenciales
    .map((c) => `Usuario: ${c.nombre}\nRol: ${c.rol}\nCorreo: ${c.email}\nContraseña temporal: ${c.password}\n`)
    .join("\n");
  writeFileSync(outPath, cuerpo, { mode: 0o600 });
  console.log(`\nCredenciales temporales guardadas en: ${outPath} (borrar tras repartir en el piloto)`);
} else {
  console.log("\nNo se generaron credenciales nuevas (todas las cuentas ya existían).");
}