import { useQuery } from '@tanstack/react-query';
import { Calendar, BookOpen, Star, ClipboardList } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { formatDate, formatTime, getStatusBadge } from '../../lib/utils';
import api from '../../lib/api';

export default function MemberDashboard() {
  const { user } = useAuth();

  const { data: bookings } = useQuery({
    queryKey: ['my-bookings'],
    queryFn: () => api.get('/bookings', { params: { limit: 5 } }).then(r => r.data),
  });

  const { data: membership } = useQuery({
    queryKey: ['my-membership'],
    queryFn: () => api.get('/memberships', { params: { limit: 1, status: 'active' } }).then(r => r.data),
  });

  const { data: attendance } = useQuery({
    queryKey: ['my-attendance'],
    queryFn: () => api.get('/attendance', { params: { limit: 100 } }).then(r => r.data),
  });

  const activeMembership = membership?.data?.[0];
  const recentBookings = bookings?.data || [];
  const attendanceRecords = attendance?.data || [];
  const presentCount = attendanceRecords.filter((a: any) => a.status === 'present').length;
  const attendancePct = attendanceRecords.length > 0 ? Math.round((presentCount / attendanceRecords.length) * 100) : 0;

  const daysLeft = activeMembership
    ? Math.max(0, Math.ceil((new Date(activeMembership.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0;

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Welcome */}
      <div style={{ background: 'linear-gradient(135deg, #0d9488, #14b8a6)', borderRadius: 16, padding: '1.5rem', color: 'white' }}>
        <p style={{ fontSize: '1.25rem', fontWeight: 700 }}>Good day, {user?.name?.split(' ')[0]}! 🧘</p>
        <p style={{ opacity: 0.85, marginTop: '0.25rem' }}>Ready for today's practice?</p>
      </div>

      {/* KPI cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
        <div className="kpi-card">
          <div className="kpi-icon" style={{ background: '#ccfbf1' }}><Star size={22} style={{ color: '#0d9488' }} /></div>
          <p className="kpi-label">Membership</p>
          <p className="kpi-value" style={{ fontSize: '1.25rem' }}>{activeMembership ? (activeMembership.planId as any)?.name || 'Active' : 'None'}</p>
          {activeMembership && <p style={{ fontSize: '0.8125rem', color: '#ef4444' }}>{daysLeft} days left</p>}
        </div>
        <div className="kpi-card">
          <div className="kpi-icon" style={{ background: '#dbeafe' }}><BookOpen size={22} style={{ color: '#2563eb' }} /></div>
          <p className="kpi-label">Total Bookings</p>
          <p className="kpi-value">{bookings?.pagination?.total ?? 0}</p>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon" style={{ background: '#dcfce7' }}><ClipboardList size={22} style={{ color: '#16a34a' }} /></div>
          <p className="kpi-label">Attended</p>
          <p className="kpi-value">{presentCount}</p>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{attendancePct}% attendance rate</p>
        </div>
      </div>

      {/* Recent bookings */}
      <div>
        <h2 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.75rem', color: 'var(--text-primary)' }}>My Recent Bookings</h2>
        {recentBookings.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
            <Calendar size={36} style={{ margin: '0 auto 0.75rem', opacity: 0.5 }} />
            <p>No bookings yet. <a href="/member/browse" style={{ color: '#0d9488', fontWeight: 600 }}>Browse classes →</a></p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {recentBookings.map((b: any) => {
              const cls = typeof b.classId === 'object' ? b.classId : null;
              return (
                <div key={b._id} className="card card-sm" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <p style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{cls?.name || 'Class'}</p>
                    <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.125rem' }}>
                      {cls?.date ? formatDate(cls.date) : '—'} {cls?.startTime ? `• ${formatTime(cls.startTime)}` : ''}
                    </p>
                  </div>
                  <span className={`badge ${getStatusBadge(b.status)}`}>{b.status}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
