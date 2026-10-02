import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, Plus, Filter, Edit, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../../lib/api';
import { formatDate, getStatusBadge, getInitials } from '../../lib/utils';
import type { User } from '../../types';

export default function MembersPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['users', { search, role, status, page }],
    queryFn: () =>
      api.get('/users', { params: { search, role, status, page, limit: 10 } }).then((r) => r.data),
    placeholderData: (prev) => prev,
  });

  const deactivate = useMutation({
    mutationFn: (id: string) => api.delete(`/users/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] }),
  });

  const users: User[] = data?.data || [];
  const pagination = data?.pagination;

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>Members</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            {pagination?.total ?? 0} total users
          </p>
        </div>
        <button className="btn btn-primary">
          <Plus size={16} /> Add Member
        </button>
      </div>

      {/* Filters */}
      <div className="card card-sm" style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={15} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search name, email, phone…"
            className="input"
            style={{ paddingLeft: '2.25rem' }}
          />
        </div>

        <select className="input" style={{ width: 'auto' }} value={role} onChange={(e) => { setRole(e.target.value); setPage(1); }}>
          <option value="">All roles</option>
          <option value="admin">Admin</option>
          <option value="instructor">Instructor</option>
          <option value="member">Member</option>
        </select>

        <select className="input" style={{ width: 'auto' }} value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="suspended">Suspended</option>
        </select>

        {(search || role || status) && (
          <button className="btn btn-ghost btn-sm" onClick={() => { setSearch(''); setRole(''); setStatus(''); setPage(1); }}>
            Clear filters
          </button>
        )}
      </div>

      {/* Table */}
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>User</th>
              <th>Role</th>
              <th>Status</th>
              <th>Joined</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={5} style={{ textAlign: 'center', padding: '3rem' }}><div className="spinner" style={{ margin: '0 auto' }} /></td></tr>
            ) : users.length === 0 ? (
              <tr><td colSpan={5} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>No users found</td></tr>
            ) : (
              users.map((u) => (
                <tr key={u._id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{
                        width: 36, height: 36, borderRadius: '50%',
                        background: 'linear-gradient(135deg, #14b8a6, #0d9488)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '0.75rem', fontWeight: 700, color: 'white', flexShrink: 0,
                      }}>
                        {getInitials(u.name)}
                      </div>
                      <div>
                        <p style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{u.name}</p>
                        <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${u.role === 'admin' ? 'badge-purple' : u.role === 'instructor' ? 'badge-blue' : 'badge-teal'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td><span className={`badge ${getStatusBadge(u.status)}`}>{u.status}</span></td>
                  <td style={{ whiteSpace: 'nowrap', color: 'var(--text-secondary)' }}>{formatDate(u.createdAt)}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button className="btn btn-ghost btn-icon btn-sm" title="Edit">
                        <Edit size={15} />
                      </button>
                      <button
                        className="btn btn-ghost btn-icon btn-sm"
                        title="Deactivate"
                        onClick={() => { if (confirm(`Deactivate ${u.name}?`)) deactivate.mutate(u._id); }}
                        style={{ color: '#ef4444' }}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Showing {(pagination.page - 1) * pagination.limit + 1}–{Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
          </p>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="btn btn-secondary btn-sm" disabled={!pagination.hasPrevPage} onClick={() => setPage(p => p - 1)}>
              <ChevronLeft size={16} />
            </button>
            <span style={{ padding: '0.375rem 0.75rem', fontSize: '0.875rem', color: 'var(--text-primary)' }}>
              {pagination.page} / {pagination.totalPages}
            </span>
            <button className="btn btn-secondary btn-sm" disabled={!pagination.hasNextPage} onClick={() => setPage(p => p + 1)}>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
