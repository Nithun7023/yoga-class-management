import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { Dumbbell, User, Mail, Phone, Lock } from 'lucide-react';
import { useState } from 'react';
import api from '../lib/api';
import { cn } from '../lib/utils';

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Enter a valid email address'),
  phone: z.string().optional(),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  path: ['confirmPassword'],
  message: 'Passwords do not match',
});

type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async ({ name, email, phone, password }: FormData) => {
    setServerError('');
    try {
      await api.post('/auth/register', { name, email, phone, password });
      navigate('/member/dashboard');
    } catch (err: any) {
      setServerError(err.response?.data?.message || 'Registration failed. Please try again.');
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-base)', padding: '2rem' }}>
      <div style={{ width: '100%', maxWidth: 480 }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem', justifyContent: 'center' }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg, #14b8a6, #0d9488)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Dumbbell size={24} color="white" />
          </div>
          <span style={{ fontWeight: 800, fontSize: '1.5rem', color: 'var(--text-primary)' }}>ZenFlow</span>
        </div>

        <div className="card">
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.375rem' }}>Create account</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.9375rem' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#0d9488', fontWeight: 600, textDecoration: 'none' }}>Sign in</Link>
          </p>

          {serverError && <div className="alert alert-error" style={{ marginBottom: '1.25rem' }}>{serverError}</div>}

          <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label className="label">Full name</label>
              <div style={{ position: 'relative' }}>
                <User size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input {...register('name')} id="name" type="text" placeholder="Your full name" className={cn('input', errors.name && 'input-error')} style={{ paddingLeft: '2.5rem' }} />
              </div>
              {errors.name && <p className="error-text">{errors.name.message}</p>}
            </div>

            <div>
              <label className="label">Email</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input {...register('email')} id="email" type="email" placeholder="you@example.com" className={cn('input', errors.email && 'input-error')} style={{ paddingLeft: '2.5rem' }} />
              </div>
              {errors.email && <p className="error-text">{errors.email.message}</p>}
            </div>

            <div>
              <label className="label">Phone <span style={{ color: 'var(--text-muted)' }}>(optional)</span></label>
              <div style={{ position: 'relative' }}>
                <Phone size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input {...register('phone')} id="phone" type="tel" placeholder="+91 99999 99999" className="input" style={{ paddingLeft: '2.5rem' }} />
              </div>
            </div>

            <div>
              <label className="label">Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input {...register('password')} id="password" type="password" placeholder="Min 8 chars, 1 uppercase, 1 number" className={cn('input', errors.password && 'input-error')} style={{ paddingLeft: '2.5rem' }} />
              </div>
              {errors.password && <p className="error-text">{errors.password.message}</p>}
            </div>

            <div>
              <label className="label">Confirm password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input {...register('confirmPassword')} id="confirmPassword" type="password" placeholder="Repeat password" className={cn('input', errors.confirmPassword && 'input-error')} style={{ paddingLeft: '2.5rem' }} />
              </div>
              {errors.confirmPassword && <p className="error-text">{errors.confirmPassword.message}</p>}
            </div>

            <button type="submit" className="btn btn-primary btn-lg" disabled={isSubmitting} style={{ width: '100%', marginTop: '0.5rem' }}>
              {isSubmitting ? <span className="spinner" style={{ width: 18, height: 18 }} /> : 'Create account'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
