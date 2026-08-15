import { NextResponse } from "next/server";
import { mkdtemp, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { convertirDocumento } from "@/lib/pdf/convert";

// Conversión de documento (PDF/DOCX/imagen) a Markdown para la descarga de cotizaciones.
// Requiere python3 + markitdown disponible en el runtime; si no, responde 503 y el
// frontend degrada a carga manual (disponibilidad: la IA nunca bloquea).

export async function POST(request: Request) {
  let dir: string | undefined;
  try {
    const form = await request.formData();
    const archivo = form.get("archivo");
    if (!(archivo instanceof File)) {
      return NextResponse.json({ error: "Archivo no recibido" }, { status: 400 });
    }

    // Guardar el archivo en un directorio temporal para pasarlo al script Python.
    dir = await mkdtemp(path.join(tmpdir(), "bia-conv-"));
    const nombreSeguro = archivo.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const ruta = path.join(dir, nombreSeguro);
    await writeFile(ruta, Buffer.from(await archivo.arrayBuffer()));

    const res = await convertirDocumento(ruta);
    if (!res.ok) {
      return NextResponse.json(
        { error: res.error ?? "No se pudo convertir el documento" },
        { status: res.error?.includes("markitdown") ? 503 : 422 }
      );
    }

    return NextResponse.json({ ok: true, markdown: res.markdown });
  } catch {
    return NextResponse.json({ error: "Error procesando el archivo" }, { status: 500 });
  } finally {
    if (dir) {
      try {
        await rm(dir, { recursive: true, force: true });
      } catch {
        // limpieza best-effort
      }
    }
  }
}