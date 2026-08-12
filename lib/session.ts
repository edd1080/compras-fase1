// Sesión simulada — Portal de Compras BIA
// TEMPORAL (Sprint 0/1): la autenticación real de coordinadores/admin es Sprint 2+.
// Este fixture permite renderizar los portales por rol hasta que exista auth.
import type { RolUsuario, Usuario } from "./domain/types";
import { usuariosFixture } from "./fixtures";

export type Sesion = {
  usuario: Usuario;
  rol: RolUsuario;
};

export const SESION_FIXTURE_ADMIN: Sesion = {
  usuario: usuariosFixture.find((u) => u.rol === "admin")!,
  rol: "admin",
};

export const SESION_FIXTURE_COORDINADOR: Sesion = {
  usuario: usuariosFixture.find((u) => u.id === "u1")!,
  rol: "coordinador",
};

export function obtenerSesionFixture(rol: RolUsuario): Sesion {
  return rol === "admin" ? SESION_FIXTURE_ADMIN : SESION_FIXTURE_COORDINADOR;
}
