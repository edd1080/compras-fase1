import { LoginForm } from "@/components/auth/LoginForm";

export default function LoginCoordinadorPage() {
  return (
    <LoginForm
      titulo="Iniciar sesión"
      descripcion="Rol: Coordinador · Equipo de Compras. Portales separados por rol."
      rol="coordinador"
      tono="coord"
    />
  );
}