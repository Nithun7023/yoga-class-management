import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, ChevronLeft, ChevronRight, Download } from 'lucide-react';
import api from '../../lib/api';
import { formatDate, getStatusBadge, getInitials } from '../../lib/utils';
import type { Booking } from '../../types';

export default function BookingsPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['bookings', { search, status, page }],
    queryFn: () => api.get('/bookings', { params: { status, page, limit: 15 } }).then(r => r.data),
    placeholderData: (p) => p,
  });

  const cancel = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      api.put(`/bookings/${id}/cancel`, { cancellationReason: reason }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['bookings'] }),
  });

  const bookings: Booking[] = data?.data || [];
  const pagination = data?.pagination;

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>Bookings</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>{pagination?.total ?? 0} total bookings</p>
        </div>
        <button className="btn btn-secondary btn-sm"><Download size={15} /> Export CSV</button>
      </div>

      <div className="card card-sm" style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 180 }}>
          <Search size={15} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search member or class…" className="input" style={{ paddingLeft: '2.25rem' }} />
        </div>
        <select className="input" style={{ width: 'auto' }} value={status} onChange={e => { setStatus(e.target.value); setPage(1); }}>
          <option value="">All statuses</option>
          <option value="confirmed">Confirmed</option>
          <option value="cancelled">Cancelled</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Member</th>
              <th>Class</th>
              <th>Class Date</th>
              <th>Booked At</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: '3rem' }}><div className="spinner" style={{ margin: '0 auto' }} /></td></tr>
            ) : bookings.length === 0 ? (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>No bookings found</td></tr>
            ) : bookings.map((b) => {
              const member = typeof b.memberId === 'object' ? b.memberId : null;
              const cls = typeof b.classId === 'object' ? b.classId : null;
              return (
                <tr key={b._id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                      <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, #14b8a6, #0d9488)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6875rem', fontWeight: 700, color: 'white', flexShrink: 0 }}>
                        {member ? getInitials(member.name) : '?'}
                      </div>
                      <div>
                        <p style={{ fontWeight: 500, fontSize: '0.875rem' }}>{member?.name || '—'}</p>
                        <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{member?.email || '—'}</p>
                      </div>
                    </div>
                  </td>
                  <td style={{ fontWeight: 500 }}>{cls?.name || '—'}</td>
                  <td style={{ whiteSpace: 'nowrap', color: 'var(--text-secondary)' }}>{cls?.date ? formatDate(cls.date) : '—'}</td>
                  <td style={{ whiteSpace: 'nowrap', color: 'var(--text-secondary)' }}>{formatDate(b.bookingDate)}</td>
                  <td><span className={`badge ${getStatusBadge(b.status)}`}>{b.status}</span></td>
                  <td>
                    {b.status === 'confirmed' && (
                      <button
                        className="btn btn-ghost btn-sm"
                        style={{ color: '#ef4444', fontSize: '0.8125rem' }}
                        onClick={() => { const reason = prompt('Cancellation reason:'); if (reason !== null) cancel.mutate({ id: b._id, reason }); }}
                      >
                        Cancel
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {pagination && pagination.totalPages > 1 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.5rem' }}>
          <button className="btn btn-secondary btn-sm" disabled={!pagination.hasPrevPage} onClick={() => setPage(p => p - 1)}><ChevronLeft size={16} /></button>
          <span style={{ fontSize: '0.875rem', color: 'var(--text-primary)' }}>{pagination.page}/{pagination.totalPages}</span>
          <button className="btn btn-secondary btn-sm" disabled={!pagination.hasNextPage} onClick={() => setPage(p => p + 1)}><ChevronRight size={16} /></button>
        </div>
      )}
    </div>
  );
}
