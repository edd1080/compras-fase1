import { LoginForm } from "@/components/auth/LoginForm";

export default function LoginAdminPage() {
  return (
    <LoginForm
      titulo="Acceso Administrador"
      descripcion="Rol: Admin · Trazabilidad. Supervisión general y métricas."
      rol="admin"
      tono="admin"
    />
  );
}