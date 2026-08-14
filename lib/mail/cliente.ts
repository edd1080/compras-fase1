// Cliente Resend para correo transaccional — Portal de Compras BIA.
// RESEND_API_KEY en entorno (nunca en repo). Si no hay clave, registra el fallo sin lanzar.
import { Resend } from "resend";

const API_KEY = process.env.RESEND_API_KEY ?? "";
const MAIL_FROM = process.env.MAIL_FROM ?? "Portal de Compras BIA <no-reply@compras.bia>";

let cliente: Resend | null = null;

export function getResend(): Resend | null {
  if (!API_KEY) return null;
  if (!cliente) cliente = new Resend(API_KEY);
  return cliente;
}

export function getRemitente(): string {
  return MAIL_FROM;
}

export async function enviarConResend(opts: {
  to: string;
  subject: string;
  html: string;
  attachments?: { filename: string; content: Uint8Array }[];
}): Promise<{ ok: boolean; id?: string; error?: string }> {
  const r = getResend();
  if (!r) {
    return { ok: false, error: "RESEND_API_KEY no configurada" };
  }
  try {
    const res = await r.emails.send({
      from: MAIL_FROM,
      to: [opts.to],
      subject: opts.subject,
      html: opts.html,
      attachments: opts.attachments?.map((a) => ({ filename: a.filename, content: Buffer.from(a.content) })),
    });
    if (res.error) return { ok: false, error: String(res.error.message ?? res.error) };
    return { ok: true, id: res.data?.id };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Error al enviar correo" };
  }
}