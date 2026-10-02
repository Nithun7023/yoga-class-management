import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, Plus, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api from '../../lib/api';
import { formatDate, formatTime, getStatusBadge } from '../../lib/utils';
import type { YogaClass } from '../../types';
import { cn } from '../../lib/utils';

const YOGA_TYPES = ['Hatha', 'Vinyasa', 'Ashtanga', 'Yin', 'Power Yoga', 'Restorative', 'Prenatal', 'Meditation', 'Beginner Yoga'];
const DIFFICULTIES = ['Beginner', 'Intermediate', 'Advanced'];
const FOCUS_AREAS = ['Flexibility', 'Strength', 'Mobility', 'Relaxation', 'Stress Relief', 'Balance', 'Core'];

const classSchema = z.object({
  name: z.string().min(2, 'Class name required'),
  type: z.enum(['Hatha', 'Vinyasa', 'Ashtanga', 'Yin', 'Power Yoga', 'Restorative', 'Prenatal', 'Meditation', 'Beginner Yoga']),
  description: z.string().optional(),
  difficulty: z.enum(['Beginner', 'Intermediate', 'Advanced']),
  instructorId: z.string().min(1, 'Select an instructor'),
  room: z.string().optional(),
  date: z.string().min(1, 'Date required'),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, 'Format HH:MM'),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, 'Format HH:MM'),
  duration: z.coerce.number().min(15).max(480),
  capacity: z.coerce.number().min(1).max(500),
});

type ClassFormData = z.infer<typeof classSchema>;

function ClassModal({ onClose, classData }: { onClose: () => void; classData?: YogaClass }) {
  const qc = useQueryClient();
  const isEdit = !!classData;

  const { data: instructors } = useQuery({
    queryKey: ['instructors-list'],
    queryFn: () => api.get('/users', { params: { role: 'instructor', limit: 100 } }).then(r => r.data.data),
  });

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ClassFormData>({
    resolver: zodResolver(classSchema),
    defaultValues: classData ? {
      name: classData.name, type: classData.type, difficulty: classData.difficulty,
      description: classData.description, room: classData.room,
      date: classData.date?.slice(0, 10),
      startTime: classData.startTime, endTime: classData.endTime,
      duration: classData.duration, capacity: classData.capacity,
      instructorId: typeof classData.instructorId === 'string' ? classData.instructorId : classData.instructorId._id,
    } : undefined,
  });

  const save = useMutation({
    mutationFn: (d: ClassFormData) => isEdit
      ? api.put(`/classes/${classData!._id}`, d)
      : api.post('/classes', d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['classes'] }); onClose(); },
  });

  return (
    <div className="modal-overlay">
      <div className="modal modal-lg">
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            {isEdit ? 'Edit Class' : 'New Yoga Class'}
          </h2>
          <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit((d) => save.mutate(d))} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div style={{ gridColumn: 'span 2' }}>
              <label className="label">Class name</label>
              <input {...register('name')} className={cn('input', errors.name && 'input-error')} placeholder="Morning Hatha Flow" />
              {errors.name && <p className="error-text">{errors.name.message}</p>}
            </div>

            <div>
              <label className="label">Yoga type</label>
              <select {...register('type')} className={cn('input', errors.type && 'input-error')}>
                <option value="">Select type</option>
                {YOGA_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              {errors.type && <p className="error-text">{errors.type.message}</p>}
            </div>

            <div>
              <label className="label">Difficulty</label>
              <select {...register('difficulty')} className={cn('input', errors.difficulty && 'input-error')}>
                {DIFFICULTIES.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>

            <div>
              <label className="label">Instructor</label>
              <select {...register('instructorId')} className={cn('input', errors.instructorId && 'input-error')}>
                <option value="">Select instructor</option>
                {instructors?.map((i: any) => <option key={i._id} value={i._id}>{i.name}</option>)}
              </select>
              {errors.instructorId && <p className="error-text">{errors.instructorId.message}</p>}
            </div>

            <div>
              <label className="label">Room / Studio</label>
              <input {...register('room')} className="input" placeholder="Studio A" />
            </div>

            <div>
              <label className="label">Date</label>
              <input {...register('date')} type="date" className={cn('input', errors.date && 'input-error')} />
              {errors.date && <p className="error-text">{errors.date.message}</p>}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label className="label">Start time</label>
                <input {...register('startTime')} type="time" className={cn('input', errors.startTime && 'input-error')} />
              </div>
              <div>
                <label className="label">End time</label>
                <input {...register('endTime')} type="time" className={cn('input', errors.endTime && 'input-error')} />
              </div>
            </div>

            <div>
              <label className="label">Duration (minutes)</label>
              <input {...register('duration')} type="number" className="input" defaultValue={60} />
            </div>

            <div>
              <label className="label">Capacity</label>
              <input {...register('capacity')} type="number" className="input" defaultValue={20} />
            </div>

            <div style={{ gridColumn: 'span 2' }}>
              <label className="label">Description</label>
              <textarea {...register('description')} className="input" rows={3} placeholder="Class description…" style={{ resize: 'vertical' }} />
            </div>
          </div>

          {save.isError && (
            <div className="alert alert-error">{(save.error as any)?.response?.data?.message || 'Save failed'}</div>
          )}

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting || save.isPending}>
              {save.isPending ? <span className="spinner" style={{ width: 16, height: 16 }} /> : (isEdit ? 'Save changes' : 'Create class')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ClassesPage() {
  const [search, setSearch] = useState('');
  const [type, setType] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState<null | 'create' | YogaClass>(null);

  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['classes', { search, type, difficulty, status, page }],
    queryFn: () => api.get('/classes', { params: { search, type, difficulty, status, page, limit: 10 } }).then(r => r.data),
    placeholderData: (p) => p,
  });

  const cancel = useMutation({
    mutationFn: (id: string) => api.delete(`/classes/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['classes'] }),
  });

  const classes: YogaClass[] = data?.data || [];
  const pagination = data?.pagination;

  const diffBadge = (d: string) => d === 'Beginner' ? 'badge-green' : d === 'Intermediate' ? 'badge-yellow' : 'badge-red';

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {modal && <ClassModal onClose={() => setModal(null)} classData={modal !== 'create' ? modal : undefined} />}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>Yoga Classes</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>{pagination?.total ?? 0} classes</p>
        </div>
        <button className="btn btn-primary" onClick={() => setModal('create')}>
          <Plus size={16} /> New Class
        </button>
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
        <select className="input" style={{ width: 'auto' }} value={status} onChange={e => { setStatus(e.target.value); setPage(1); }}>
          <option value="">All statuses</option>
          <option value="scheduled">Scheduled</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Class</th>
              <th>Type</th>
              <th>Instructor</th>
              <th>Date & Time</th>
              <th>Capacity</th>
              <th>Difficulty</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={8} style={{ textAlign: 'center', padding: '3rem' }}><div className="spinner" style={{ margin: '0 auto' }} /></td></tr>
            ) : classes.length === 0 ? (
              <tr><td colSpan={8} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>No classes found</td></tr>
            ) : classes.map(c => (
              <tr key={c._id}>
                <td>
                  <p style={{ fontWeight: 500 }}>{c.name}</p>
                  {c.room && <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{c.room}</p>}
                </td>
                <td><span className="badge badge-teal">{c.type}</span></td>
                <td style={{ color: 'var(--text-secondary)' }}>
                  {typeof c.instructorId === 'object' ? c.instructorId.name : '—'}
                </td>
                <td style={{ whiteSpace: 'nowrap' }}>
                  <p style={{ fontSize: '0.875rem' }}>{formatDate(c.date)}</p>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{formatTime(c.startTime)} – {formatTime(c.endTime)}</p>
                </td>
                <td>
                  <p style={{ fontSize: '0.875rem' }}>{c.bookedCount}/{c.capacity}</p>
                  <div style={{ height: 4, background: 'var(--bg-muted)', borderRadius: 2, marginTop: 4, width: 60 }}>
                    <div style={{
                      height: '100%',
                      borderRadius: 2,
                      width: `${Math.min(100, (c.bookedCount / c.capacity) * 100)}%`,
                      background: c.isFull ? '#ef4444' : '#14b8a6',
                    }} />
                  </div>
                </td>
                <td><span className={`badge ${diffBadge(c.difficulty)}`}>{c.difficulty}</span></td>
                <td><span className={`badge ${getStatusBadge(c.status)}`}>{c.status}</span></td>
                <td>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className="btn btn-ghost btn-icon btn-sm" onClick={() => setModal(c)}><span style={{ fontSize: 15 }}>✏️</span></button>
                    <button className="btn btn-ghost btn-icon btn-sm" style={{ color: '#ef4444' }} onClick={() => { if (confirm('Cancel this class?')) cancel.mutate(c._id); }}><span style={{ fontSize: 15 }}>❌</span></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Page {pagination.page} of {pagination.totalPages}
          </p>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="btn btn-secondary btn-sm" disabled={!pagination.hasPrevPage} onClick={() => setPage(p => p - 1)}><ChevronLeft size={16} /></button>
            <button className="btn btn-secondary btn-sm" disabled={!pagination.hasNextPage} onClick={() => setPage(p => p + 1)}><ChevronRight size={16} /></button>
          </div>
        </div>
      )}
    </div>
  );
}
