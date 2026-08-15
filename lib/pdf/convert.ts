import { execFile } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";

const SCRIPT = path.resolve(process.cwd(), "scripts", "convert-document.py");

export type ResultadoConversion =
  | { ok: true; markdown: string }
  | { ok: false; error: string };

function ejecutarPython(rutaArchivo: string): Promise<string> {
  return new Promise((resolve, reject) => {
    execFile("python3", [SCRIPT, rutaArchivo], {
      timeout: 30000,
      maxBuffer: 10 * 1024 * 1024,
    }, (error, stdout) => {
      if (error) {
        reject(error);
      } else {
        resolve(stdout);
      }
    });
  });
}

export async function convertirDocumento(rutaArchivo: string): Promise<ResultadoConversion> {
  if (!existsSync(SCRIPT)) {
    return { ok: false, error: "convert-document.py no encontrado" };
  }

  try {
    // Verificar que python3 y markitdown están disponibles.
    await ejecutarPython(rutaArchivo);
    const markdown = await ejecutarPython(rutaArchivo);
    if (!markdown.trim()) {
      return { ok: false, error: "El documento no contiene texto extraíble" };
    }
    return { ok: true, markdown };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg.includes("markitdown no instalado")) {
      return { ok: false, error: "markitdown no instalado. Ejecutá: pip install markitdown[pdf]" };
    }
    return { ok: false, error: `Error al convertir: ${msg}` };
  }
}

export async function testMarkitdownDisponible(): Promise<boolean> {
  try {
    await ejecutarPython("");
    return true;
  } catch {
    return false;
  }
}