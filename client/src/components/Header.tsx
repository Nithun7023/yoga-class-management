import { Menu, Sun, Moon, Monitor, Bell } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';

interface HeaderProps {
  onMenuClick: () => void;
  title?: string;
}

export default function Header({ onMenuClick, title }: HeaderProps) {
  const { theme, setTheme } = useTheme();
  const { user } = useAuth();

  const themeOptions: { value: 'light' | 'dark' | 'system'; icon: typeof Sun }[] = [
    { value: 'light', icon: Sun },
    { value: 'dark', icon: Moon },
    { value: 'system', icon: Monitor },
  ];

  return (
    <header className="header">
      {/* Mobile menu toggle */}
      <button className="btn btn-ghost btn-icon md:hidden" onClick={onMenuClick}>
        <Menu size={20} />
      </button>

      {/* Page title */}
      {title && (
        <h1 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-primary)', flex: 1 }}>
          {title}
        </h1>
      )}
      <div style={{ flex: 1 }} />

      {/* Theme switcher */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', background: 'var(--bg-muted)', borderRadius: 8, padding: '0.25rem' }}>
        {themeOptions.map(({ value, icon: Icon }) => (
          <button
            key={value}
            onClick={() => setTheme(value)}
            className="btn btn-ghost btn-icon"
            style={{
              padding: '0.375rem',
              background: theme === value ? 'var(--bg-card)' : 'transparent',
              color: theme === value ? 'var(--color-teal-500)' : 'var(--text-muted)',
              boxShadow: theme === value ? 'var(--shadow-sm)' : 'none',
            }}
            title={`${value} mode`}
          >
            <Icon size={16} />
          </button>
        ))}
      </div>

      {/* Notifications placeholder */}
      <button className="btn btn-ghost btn-icon" style={{ position: 'relative' }}>
        <Bell size={18} />
        <span style={{
          position: 'absolute',
          top: 6,
          right: 6,
          width: 8,
          height: 8,
          borderRadius: '50%',
          background: '#ef4444',
          border: '2px solid var(--bg-card)',
        }} />
      </button>

      {/* Avatar */}
      <Link to={`/${user?.role}/profile`} style={{ textDecoration: 'none' }}>
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #14b8a6, #0d9488)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.875rem',
            fontWeight: 700,
            color: 'white',
            cursor: 'pointer',
          }}
        >
          {user?.name?.charAt(0).toUpperCase()}
        </div>
      </Link>
    </header>
  );
}
