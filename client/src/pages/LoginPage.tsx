import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Dumbbell, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { cn } from '../lib/utils';

const schema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});
type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async ({ email, password }: FormData) => {
    setServerError('');
    try {
      await login(email, password);
      const from = (location.state as any)?.from?.pathname;
      // Redirect to the role-appropriate dashboard
      navigate(from || '/dashboard');
    } catch (err: any) {
      setServerError(err.response?.data?.message || 'Login failed. Please try again.');
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        background: 'linear-gradient(135deg, #f0fdf4 0%, #ccfbf1 50%, #e0f2fe 100%)',
      }}
      className="dark:bg-gray-900"
    >
      {/* Left visual panel */}
      <div
        style={{
          flex: 1,
          background: 'linear-gradient(135deg, #0d9488 0%, #14b8a6 50%, #0891b2 100%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '3rem',
          color: 'white',
        }}
        className="hidden lg:flex"
      >
        <div style={{ textAlign: 'center', maxWidth: 400 }}>
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: 20,
              background: 'rgba(255,255,255,0.2)',
              backdropFilter: 'blur(10px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 2rem',
            }}
          >
            <Dumbbell size={40} />
          </div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '1rem', lineHeight: 1.2 }}>
            Welcome to ZenFlow
          </h1>
          <p style={{ fontSize: '1.125rem', opacity: 0.85, lineHeight: 1.7 }}>
            Your complete yoga studio management platform. Classes, bookings, memberships, and mindful management — all in one place.
          </p>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '2.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            {['Hatha', 'Vinyasa', 'Yin', 'Meditation', 'Ashtanga'].map((t) => (
              <span
                key={t}
                style={{
                  background: 'rgba(255,255,255,0.2)',
                  padding: '0.375rem 1rem',
                  borderRadius: 999,
                  fontSize: '0.875rem',
                  backdropFilter: 'blur(4px)',
                }}
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
          background: 'var(--bg-base)',
        }}
      >
        <div style={{ width: '100%', maxWidth: 420 }}>
          {/* Mobile logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }} className="lg:hidden">
            <div style={{ width: 40, height: 40, borderRadius: 10, background: 'linear-gradient(135deg, #14b8a6, #0d9488)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Dumbbell size={22} color="white" />
            </div>
            <span style={{ fontWeight: 700, fontSize: '1.25rem', color: 'var(--text-primary)' }}>ZenFlow</span>
          </div>

          <h2 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
            Sign in
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '0.9375rem' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: 'var(--color-teal-600)', fontWeight: 600, textDecoration: 'none' }}>
              Create one
            </Link>
          </p>

          {serverError && (
            <div className="alert alert-error" style={{ marginBottom: '1.5rem' }}>
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label className="label">Email address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  {...register('email')}
                  type="email"
                  id="email"
                  placeholder="you@example.com"
                  className={cn('input', errors.email && 'input-error')}
                  style={{ paddingLeft: '2.5rem' }}
                  autoComplete="email"
                />
              </div>
              {errors.email && <p className="error-text">{errors.email.message}</p>}
            </div>

            <div>
              <label className="label">Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  placeholder="••••••••"
                  className={cn('input', errors.password && 'input-error')}
                  style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem' }}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="error-text">{errors.password.message}</p>}
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg"
              disabled={isSubmitting}
              style={{ width: '100%', marginTop: '0.5rem' }}
            >
              {isSubmitting ? <span className="spinner" style={{ width: 18, height: 18 }} /> : 'Sign in'}
            </button>
          </form>

          {/* Demo credentials */}
          <div className="card card-sm" style={{ marginTop: '2rem', fontSize: '0.8125rem', background: 'var(--bg-muted)' }}>
            <p style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>🔑 Demo accounts</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', color: 'var(--text-secondary)' }}>
              <p>Admin: <strong>admin@yoga.com</strong> / Password123!</p>
              <p>Instructor: <strong>priya@yoga.com</strong> / Password123!</p>
              <p>Member: <strong>rahul@yoga.com</strong> / Password123!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
