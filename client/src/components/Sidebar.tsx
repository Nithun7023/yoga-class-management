import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, UserCheck, Calendar, BookOpen,
  ClipboardList, CreditCard, BarChart2, Settings, LogOut,
  Dumbbell, Star, ChevronDown,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { cn } from '../lib/utils';

const adminNav = [
  { section: 'Overview', items: [{ to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' }] },
  {
    section: 'Management',
    items: [
      { to: '/admin/members', icon: Users, label: 'Members' },
      { to: '/admin/instructors', icon: UserCheck, label: 'Instructors' },
      { to: '/admin/classes', icon: Calendar, label: 'Classes' },
      { to: '/admin/bookings', icon: BookOpen, label: 'Bookings' },
      { to: '/admin/attendance', icon: ClipboardList, label: 'Attendance' },
    ],
  },
  {
    section: 'Finance',
    items: [
      { to: '/admin/plans', icon: Star, label: 'Membership Plans' },
      { to: '/admin/memberships', icon: Dumbbell, label: 'Memberships' },
      { to: '/admin/payments', icon: CreditCard, label: 'Payments' },
    ],
  },
  {
    section: 'Analytics',
    items: [{ to: '/admin/reports', icon: BarChart2, label: 'Reports' }],
  },
  {
    section: 'System',
    items: [{ to: '/admin/settings', icon: Settings, label: 'Settings' }],
  },
];

const instructorNav = [
  { section: 'Overview', items: [{ to: '/instructor/dashboard', icon: LayoutDashboard, label: 'Dashboard' }] },
  {
    section: 'Teaching',
    items: [
      { to: '/instructor/classes', icon: Calendar, label: 'My Classes' },
      { to: '/instructor/students', icon: Users, label: 'Students' },
      { to: '/instructor/attendance', icon: ClipboardList, label: 'Attendance' },
    ],
  },
];

const memberNav = [
  { section: 'My Yoga', items: [{ to: '/member/dashboard', icon: LayoutDashboard, label: 'Dashboard' }] },
  {
    section: 'Classes',
    items: [
      { to: '/member/browse', icon: Calendar, label: 'Browse Classes' },
      { to: '/member/bookings', icon: BookOpen, label: 'My Bookings' },
      { to: '/member/attendance', icon: ClipboardList, label: 'Attendance History' },
    ],
  },
  {
    section: 'Account',
    items: [{ to: '/member/membership', icon: Star, label: 'My Membership' }],
  },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const navItems = user?.role === 'admin'
    ? adminNav
    : user?.role === 'instructor'
    ? instructorNav
    : memberNav;

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <>
      {/* Overlay on mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      <aside className={cn('sidebar', isOpen && 'open')}>
        {/* Logo */}
        <div className="sidebar-logo">
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: 'linear-gradient(135deg, #14b8a6, #0d9488)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Dumbbell size={20} color="white" />
          </div>
          <div>
            <p style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--text-primary)' }}>ZenFlow</p>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Yoga Studio</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          {navItems.map(({ section, items }) => (
            <div key={section}>
              <p className="nav-section-title">{section}</p>
              {items.map(({ to, icon: Icon, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) => cn('nav-item', isActive && 'active')}
                  onClick={onClose}
                >
                  <Icon size={18} />
                  {label}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        {/* User section */}
        <div style={{ borderTop: '1px solid var(--border)', padding: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #14b8a6, #0d9488)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.75rem',
                fontWeight: 700,
                color: 'white',
                flexShrink: 0,
              }}
            >
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.name}
              </p>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>{user?.role}</p>
            </div>
          </div>
          <button className="btn btn-ghost btn-sm" style={{ width: '100%', justifyContent: 'flex-start' }} onClick={handleLogout}>
            <LogOut size={16} />
            Sign out
          </button>
        </div>
      </aside>
    </>
  );
}
