import { useQuery } from '@tanstack/react-query';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { Users, Calendar, BookOpen, TrendingUp, DollarSign, Activity } from 'lucide-react';
import api from '../../lib/api';
import { formatCurrency, formatDate, getStatusBadge } from '../../lib/utils';

const COLORS = ['#14b8a6', '#0891b2', '#8b5cf6', '#f59e0b', '#ef4444'];

function KPICard({ icon: Icon, label, value, color, subtitle }: {
  icon: typeof Users; label: string; value: string | number;
  color: string; subtitle?: string;
}) {
  return (
    <div className="kpi-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <p className="kpi-label">{label}</p>
          <p className="kpi-value">{value}</p>
          {subtitle && <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>{subtitle}</p>}
        </div>
        <div className="kpi-icon" style={{ background: color + '20' }}>
          <Icon size={24} style={{ color }} />
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => api.get('/reports/dashboard').then((r) => r.data.data),
    refetchInterval: 60000,
  });

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <div className="spinner" style={{ width: 40, height: 40 }} />
      </div>
    );
  }

  const { kpis, weeklyBookings, membershipStatusBreakdown, classPopularity, recentBookings, expiringMemberships } = data || {};

  const weeklyData = weeklyBookings?.map((d: any) => ({
    date: d._id.slice(5), // MM-DD
    bookings: d.count,
  })) || [];

  const pieData = membershipStatusBreakdown?.map((d: any) => ({
    name: d._id.charAt(0).toUpperCase() + d._id.slice(1),
    value: d.count,
  })) || [];

  const popularityData = classPopularity?.map((d: any) => ({
    name: d.className?.length > 20 ? d.className.slice(0, 18) + '…' : d.className,
    bookings: d.bookings,
  })) || [];

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Page header */}
      <div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>Admin Dashboard</h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>Overview of your yoga studio</p>
      </div>

      {/* KPI Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        <KPICard icon={Users} label="Total Members" value={kpis?.totalMembers ?? 0} color="#14b8a6" />
        <KPICard icon={Activity} label="Active Members" value={kpis?.activeMembers ?? 0} color="#0891b2" />
        <KPICard icon={Calendar} label="Classes Today" value={kpis?.classesToday ?? 0} color="#8b5cf6" />
        <KPICard icon={BookOpen} label="Bookings Today" value={kpis?.bookingsToday ?? 0} color="#f59e0b" />
        <KPICard icon={TrendingUp} label="Occupancy Rate" value={`${kpis?.occupancyRate ?? 0}%`} color="#ef4444" />
        <KPICard icon={DollarSign} label="Monthly Revenue" value={formatCurrency(kpis?.monthlyRevenue ?? 0)} color="#22c55e" />
      </div>

      {/* Charts row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem' }}>
        {/* Weekly bookings */}
        <div className="chart-wrapper">
          <p className="chart-title">📈 Weekly Booking Trend</p>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="date" tick={{ fontSize: 12, fill: 'var(--text-muted)' }} />
              <YAxis tick={{ fontSize: 12, fill: 'var(--text-muted)' }} />
              <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8 }} />
              <Line type="monotone" dataKey="bookings" stroke="#14b8a6" strokeWidth={2} dot={{ fill: '#14b8a6', r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Membership status pie */}
        <div className="chart-wrapper">
          <p className="chart-title">🍩 Membership Status</p>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} dataKey="value" label={({ name, value }) => `${name}: ${value}`} labelLine={false}>
                {pieData.map((_: any, i: number) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Class popularity */}
        <div className="chart-wrapper" style={{ gridColumn: 'span 2' }}>
          <p className="chart-title">🏆 Class Popularity</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={popularityData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis type="number" tick={{ fontSize: 12, fill: 'var(--text-muted)' }} />
              <YAxis dataKey="name" type="category" width={140} tick={{ fontSize: 12, fill: 'var(--text-muted)' }} />
              <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8 }} />
              <Bar dataKey="bookings" fill="#14b8a6" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tables row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>
        {/* Recent Bookings */}
        <div>
          <h2 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.75rem', color: 'var(--text-primary)' }}>Recent Bookings</h2>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Member</th>
                  <th>Class</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentBookings?.map((b: any) => (
                  <tr key={b._id}>
                    <td>{b.memberId?.name || '—'}</td>
                    <td style={{ maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {b.classId?.name || '—'}
                    </td>
                    <td style={{ whiteSpace: 'nowrap' }}>{b.classId?.date ? formatDate(b.classId.date) : '—'}</td>
                    <td><span className={`badge ${getStatusBadge(b.status)}`}>{b.status}</span></td>
                  </tr>
                ))}
                {(!recentBookings || recentBookings.length === 0) && (
                  <tr><td colSpan={4} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>No bookings yet</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Expiring Memberships */}
        <div>
          <h2 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.75rem', color: 'var(--text-primary)' }}>
            ⚠️ Expiring Memberships (7 days)
          </h2>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Member</th>
                  <th>Plan</th>
                  <th>Expires</th>
                </tr>
              </thead>
              <tbody>
                {expiringMemberships?.map((m: any) => (
                  <tr key={m._id}>
                    <td>{m.memberId?.name || '—'}</td>
                    <td>{m.planId?.name || '—'}</td>
                    <td style={{ color: '#ef4444', whiteSpace: 'nowrap' }}>{formatDate(m.endDate)}</td>
                  </tr>
                ))}
                {(!expiringMemberships || expiringMemberships.length === 0) && (
                  <tr><td colSpan={3} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>No expiring memberships 🎉</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
