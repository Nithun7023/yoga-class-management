import { useQuery } from '@tanstack/react-query';
import { Calendar, Users, ClipboardCheck } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { formatDate, formatTime } from '../../lib/utils';
import api from '../../lib/api';

export default function InstructorDashboard() {
  const { user } = useAuth();

  const { data: myClasses } = useQuery({
    queryKey: ['instructor-classes'],
    queryFn: () => api.get('/classes', { params: { instructorId: user?._id, status: 'scheduled', limit: 10 } }).then(r => r.data),
  });

  const classes = myClasses?.data || [];
  const today = new Date().toDateString();
  const todayClasses = classes.filter((c: any) => new Date(c.date).toDateString() === today);

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ background: 'linear-gradient(135deg, #0891b2, #0d9488)', borderRadius: 16, padding: '1.5rem', color: 'white' }}>
        <p style={{ fontSize: '1.25rem', fontWeight: 700 }}>Welcome, {user?.name?.split(' ')[0]}! 🌿</p>
        <p style={{ opacity: 0.85, marginTop: '0.25rem' }}>
          You have {todayClasses.length} class{todayClasses.length !== 1 ? 'es' : ''} today
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
        <div className="kpi-card">
          <div className="kpi-icon" style={{ background: '#ccfbf1' }}><Calendar size={22} style={{ color: '#0d9488' }} /></div>
          <p className="kpi-label">Classes Today</p>
          <p className="kpi-value">{todayClasses.length}</p>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon" style={{ background: '#dbeafe' }}><Calendar size={22} style={{ color: '#2563eb' }} /></div>
          <p className="kpi-label">Upcoming Classes</p>
          <p className="kpi-value">{classes.length}</p>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon" style={{ background: '#dcfce7' }}><Users size={22} style={{ color: '#16a34a' }} /></div>
          <p className="kpi-label">Total Booked Seats</p>
          <p className="kpi-value">{classes.reduce((s: number, c: any) => s + c.bookedCount, 0)}</p>
        </div>
      </div>

      <div>
        <h2 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.75rem', color: 'var(--text-primary)' }}>Upcoming Classes</h2>
        {classes.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No classes scheduled</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {classes.map((c: any) => (
              <div key={c._id} className="card card-sm" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div>
                  <p style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{c.name}</p>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                    {formatDate(c.date)} • {formatTime(c.startTime)} – {formatTime(c.endTime)} • {c.room || 'No room set'}
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    <Users size={14} style={{ display: 'inline', marginRight: 4 }} />
                    {c.bookedCount}/{c.capacity}
                  </span>
                  <a href={`/instructor/attendance?classId=${c._id}`} className="btn btn-primary btn-sm">
                    <ClipboardCheck size={14} /> Mark Attendance
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
