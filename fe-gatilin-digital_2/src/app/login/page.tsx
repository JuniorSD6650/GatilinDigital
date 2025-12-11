import LoginForm from '@/components/auth/LoginForm';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 relative">
      
      {/* Fondo decorativo */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-festivo-gold/5 via-transparent to-festivo-red/5"></div>
      
      {/* Contenido */}
      <LoginForm />
      
    </div>
  );
}
