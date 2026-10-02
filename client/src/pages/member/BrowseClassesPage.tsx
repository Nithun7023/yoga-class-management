import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, Filter, Clock, Users, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../../lib/api';
import { formatDate, formatTime } from '../../lib/utils';
import type { YogaClass } from '../../types';

const YOGA_TYPES = ['Hatha', 'Vinyasa', 'Ashtanga', 'Yin', 'Power Yoga', 'Restorative', 'Prenatal', 'Meditation', 'Beginner Yoga'];
const DIFFICULTIES = ['Beginner', 'Intermediate', 'Advanced'];

const diffColor = (d: string) => d === 'Beginner' ? '#16a34a' : d === 'Intermediate' ? '#d97706' : '#dc2626';
const diffBg = (d: string) => d === 'Beginner' ? '#dcfce7' : d === 'Intermediate' ? '#fef3c7' : '#fee2e2';

export default function BrowseClassesPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [type, setType] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [date, setDate] = useState('');
  const [page, setPage] = useState(1);
  const [bookingStatus, setBookingStatus] = useState<Record<string, 'idle' | 'booking' | 'booked' | 'error'>>({});

  const { data, isLoading } = useQuery({
    queryKey: ['browse-classes', { search, type, difficulty, date, page }],
    queryFn: () => api.get('/classes', { params: { search, type, difficulty, date, status: 'scheduled', page, limit: 9 } }).then(r => r.data),
    placeholderData: (p) => p,
  });

  const book = useMutation({
    mutationFn: (classId: string) => api.post('/bookings', { classId }),
    onMutate: (classId) => setBookingStatus(prev => ({ ...prev, [classId]: 'booking' })),
    onSuccess: (_, classId) => {
      setBookingStatus(prev => ({ ...prev, [classId]: 'booked' }));
      qc.invalidateQueries({ queryKey: ['browse-classes'] });
      qc.invalidateQueries({ queryKey: ['my-bookings'] });
    },
    onError: (_, classId) => setBookingStatus(prev => ({ ...prev, [classId]: 'error' })),
  });

  const classes: YogaClass[] = data?.data || [];
  const pagination = data?.pagination;

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>Browse Classes</h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>Find and book your next yoga session</p>
      </div>

      {/* Filters */}
      <div className="card card-sm" style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 180 }}>
          <Search size={15} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search class name…" className="input" style={{ paddingLeft: '2.25rem' }} />
        </div>
        <select className="input" style={{ width: 'auto' }} value={type} onChange={e => { setType(e.target.value); setPage(1); }}>
          <option value="">All types</option>
          {YOGA_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <select className="input" style={{ width: 'auto' }} value={difficulty} onChange={e => { setDifficulty(e.target.value); setPage(1); }}>
          <option value="">All levels</option>
          {DIFFICULTIES.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
        <input type="date" className="input" style={{ width: 'auto' }} value={date} onChange={e => { setDate(e.target.value); setPage(1); }} />
        {(search || type || difficulty || date) && (
          <button className="btn btn-ghost btn-sm" onClick={() => { setSearch(''); setType(''); setDifficulty(''); setDate(''); setPage(1); }}>Clear</button>
        )}
      </div>

      {/* Class cards grid */}
      {isLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}><div className="spinner" style={{ width: 40, height: 40 }} /></div>
      ) : classes.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
          <p style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>🧘 No classes found</p>
          <p>Try adjusting your filters</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
          {classes.map((c) => {
            const instructor = typeof c.instructorId === 'object' ? c.instructorId : null;
            const btnState = bookingStatus[c._id] || 'idle';
            const isBooked = btnState === 'booked';
            const isBooking = btnState === 'booking';
            const occupancyPct = Math.round((c.bookedCount / c.capacity) * 100);

            return (
              <div key={c._id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem', transition: 'transform 0.2s ease, box-shadow 0.2s ease' }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <p style={{ fontWeight: 700, fontSize: '1.0625rem', color: 'var(--text-primary)' }}>{c.name}</p>
                    <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.125rem' }}>
                      with {instructor?.name || 'Instructor'}
                    </p>
                  </div>
                  <span style={{ background: diffBg(c.difficulty), color: diffColor(c.difficulty), padding: '0.125rem 0.5rem', borderRadius: 999, fontSize: '0.75rem', fontWeight: 500, whiteSpace: 'nowrap' }}>
                    {c.difficulty}
                  </span>
                </div>

                {/* Type badge */}
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <span className="badge badge-teal">{c.type}</span>
                  {c.focusArea.slice(0, 2).map(f => (
                    <span key={f} className="badge badge-gray">{f}</span>
                  ))}
                </div>

                {/* Date/time */}
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    <Clock size={14} />
                    {formatDate(c.date)} • {formatTime(c.startTime)}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    <Users size={14} />
                    {c.bookedCount}/{c.capacity}
                  </div>
                </div>

                {/* Capacity bar */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                    <span>{c.isFull ? '🔴 Full' : `${c.availableSlots} slots left`}</span>
                    <span>{occupancyPct}%</span>
                  </div>
                  <div style={{ height: 6, background: 'var(--bg-muted)', borderRadius: 3 }}>
                    <div style={{ height: '100%', borderRadius: 3, width: `${occupancyPct}%`, background: c.isFull ? '#ef4444' : occupancyPct > 80 ? '#f59e0b' : '#14b8a6', transition: 'width 0.4s ease' }} />
                  </div>
                </div>

                {/* Book button */}
                <button
                  className={`btn ${isBooked ? 'btn-secondary' : 'btn-primary'}`}
                  style={{ width: '100%' }}
                  disabled={c.isFull || isBooked || isBooking}
                  onClick={() => book.mutate(c._id)}
                >
                  {isBooking ? <span className="spinner" style={{ width: 16, height: 16 }} /> :
                   isBooked ? '✓ Booked!' :
                   c.isFull ? 'Class Full' : 'Book Now'}
                </button>

                {btnState === 'error' && (
                  <p className="error-text" style={{ textAlign: 'center' }}>Already booked or booking failed</p>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
          <button className="btn btn-secondary btn-sm" disabled={!pagination.hasPrevPage} onClick={() => setPage(p => p - 1)}><ChevronLeft size={16} /></button>
          <span style={{ fontSize: '0.875rem', color: 'var(--text-primary)' }}>{pagination.page} / {pagination.totalPages}</span>
          <button className="btn btn-secondary btn-sm" disabled={!pagination.hasNextPage} onClick={() => setPage(p => p + 1)}><ChevronRight size={16} /></button>
        </div>
      )}
    </div>
  );
}
