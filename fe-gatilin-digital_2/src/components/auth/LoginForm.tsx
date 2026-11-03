'use client';

import { useState, FormEvent } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { login } from '@/services/apis/api-auth';
import { IconArrowLeft, IconEye, IconEyeOff, IconLock, IconUser, IconAlert, Spinner } from '@/components/ui/Icons';

export default function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(params.get('expirado') ? 'Tu sesión expiró. Vuelve a iniciar sesión.' : '');
  const [showPassword, setShowPassword] = useState(false);
  // Solo se vuelve a rutas internas del panel (evita redirecciones abiertas)
  const volver = params.get('volver') || '';
  const destinoSeguro = (rol: string) =>
    rol === 'admin' && /^\/admin(\/[a-z-]*)?$/.test(volver) ? volver
    : rol === 'localizador' && /^\/localizador(\/[a-z-]*)?$/.test(volver) ? volver
    : rol === 'admin' ? '/admin' : '/localizador';

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await login(credentials);

      if (response.success && response.user) {
        // Redirigir según el rol (o a la página donde expiró la sesión)
        const rol = response.user.rol ?? '';
        if (rol === 'admin' || rol === 'localizador') router.push(destinoSeguro(rol));
      } else {
        setError(response.message || 'Credenciales incorrectas');
      }
    } catch (err) {
      setError('Error al conectar con el servidor');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-sm animate-in">
      {/* Marca (móvil) */}
      <Link href="/" className="mb-10 inline-flex items-center gap-3 lg:hidden">
        <Image src="/logo.svg" alt="" width={36} height={36} className="h-9 w-9" />
        <span className="font-display text-xl font-semibold text-white">
          Gatilín<span className="text-oro">Digital</span>
        </span>
      </Link>

      <div className="mb-8">
        <span className="grid h-12 w-12 place-items-center rounded-2xl border border-oro/30 bg-oro/10 text-oro">
          <IconLock className="w-6 h-6" />
        </span>
        <h2 className="mt-5 font-display text-3xl font-semibold text-white">Iniciar sesión</h2>
        <p className="mt-1.5 text-sm text-white/55">Acceso para administradores y localizadores.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div role="alert" className="flex items-start gap-2.5 rounded-xl border border-red-500/40 bg-red-500/10 p-3.5 text-sm text-red-300 animate-in">
            <IconAlert className="mt-px w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        <div>
          <label htmlFor="username" className="field-label">Usuario</label>
          <div className="relative">
            <IconUser className="pointer-events-none absolute left-3.5 top-1/2 w-5 h-5 -translate-y-1/2 text-white/35" />
            <input
              id="username"
              type="text"
              autoComplete="username"
              value={credentials.username}
              onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
              className="field-input !pl-11"
              placeholder="Ingresa tu usuario"
              required
              disabled={loading}
            />
          </div>
        </div>

        <div>
          <label htmlFor="password" className="field-label">Contraseña</label>
          <div className="relative">
            <IconLock className="pointer-events-none absolute left-3.5 top-1/2 w-5 h-5 -translate-y-1/2 text-white/35" />
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              value={credentials.password}
              onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
              className="field-input !pl-11 !pr-12"
              placeholder="••••••••"
              required
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              className="absolute right-2 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-lg text-white/45 transition-colors hover:bg-white/5 hover:text-oro"
              disabled={loading}
            >
              {showPassword ? <IconEyeOff className="w-5 h-5" /> : <IconEye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        <button type="submit" disabled={loading} className="btn btn-oro w-full !rounded-xl py-3.5 text-base">
          {loading ? (
            <>
              <Spinner className="w-5 h-5" /> Ingresando...
            </>
          ) : (
            'Ingresar'
          )}
        </button>
      </form>

      <Link href="/" className="group mt-8 inline-flex items-center gap-2 text-sm text-white/50 transition-colors hover:text-oro">
        <IconArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
        Volver al inicio
      </Link>
    </div>
  );
}
