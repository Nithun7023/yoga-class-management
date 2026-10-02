import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, Plus, Edit, Trash2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api from '../../lib/api';
import { formatCurrency, getStatusBadge } from '../../lib/utils';
import type { MembershipPlan } from '../../types';

const planSchema = z.object({
  name: z.string().min(2, 'Name required'),
  duration: z.coerce.number().min(1, 'Duration must be at least 1 day'),
  price: z.coerce.number().min(0, 'Price cannot be negative'),
  classLimit: z.coerce.number().nullable(),
  description: z.string().optional(),
  status: z.enum(['active', 'inactive']),
});
type PlanFormData = z.infer<typeof planSchema>;

function PlanModal({ onClose, planData }: { onClose: () => void; planData?: MembershipPlan }) {
  const qc = useQueryClient();
  const isEdit = !!planData;

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<PlanFormData>({
    resolver: zodResolver(planSchema),
    defaultValues: planData ? {
      name: planData.name, duration: planData.duration, price: planData.price,
      classLimit: planData.classLimit, description: planData.description, status: planData.status
    } : { status: 'active', classLimit: null },
  });

  const save = useMutation({
    mutationFn: (d: PlanFormData) => isEdit ? api.put(`/membership-plans/${planData!._id}`, d) : api.post('/membership-plans', d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['membership-plans'] }); onClose(); },
  });

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.25rem' }}>
          {isEdit ? 'Edit Plan' : 'New Membership Plan'}
        </h2>
        <form onSubmit={handleSubmit(d => save.mutate(d))} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label className="label">Plan Name</label>
            <input {...register('name')} className="input" placeholder="e.g. Monthly Unlimited" />
            {errors.name && <p className="error-text">{errors.name.message}</p>}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label className="label">Duration (days)</label>
              <input {...register('duration')} type="number" className="input" />
            </div>
            <div>
              <label className="label">Price</label>
              <input {...register('price')} type="number" className="input" />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label className="label">Class Limit (leave empty for unlimited)</label>
              <input {...register('classLimit')} type="number" className="input" />
            </div>
            <div>
              <label className="label">Status</label>
              <select {...register('status')} className="input">
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
          <div>
            <label className="label">Description</label>
            <textarea {...register('description')} className="input" rows={3} />
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting || save.isPending}>Save</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function MembershipPlansPage() {
  const qc = useQueryClient();
  const [modal, setModal] = useState<null | 'create' | MembershipPlan>(null);
  
  const { data, isLoading } = useQuery({
    queryKey: ['membership-plans'],
    queryFn: () => api.get('/membership-plans').then(r => r.data.data),
  });

  const plans: MembershipPlan[] = data || [];

  const deletePlan = useMutation({
    mutationFn: (id: string) => api.delete(`/membership-plans/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['membership-plans'] }),
  });

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {modal && <PlanModal onClose={() => setModal(null)} planData={modal !== 'create' ? modal : undefined} />}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>Membership Plans</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Manage pricing and subscription tiers</p>
        </div>
        <button className="btn btn-primary" onClick={() => setModal('create')}>
          <Plus size={16} /> New Plan
        </button>
      </div>

      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Plan Name</th>
              <th>Price</th>
              <th>Duration</th>
              <th>Class Limit</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? <tr><td colSpan={6} style={{ textAlign: 'center', padding: '2rem' }}>Loading...</td></tr> : 
             plans.length === 0 ? <tr><td colSpan={6} style={{ textAlign: 'center', padding: '2rem' }}>No plans found</td></tr> :
             plans.map(p => (
               <tr key={p._id}>
                 <td style={{ fontWeight: 500 }}>{p.name}</td>
                 <td>{formatCurrency(p.price)}</td>
                 <td>{p.duration} days</td>
                 <td>{p.classLimit ? p.classLimit : 'Unlimited'}</td>
                 <td><span className={`badge ${getStatusBadge(p.status)}`}>{p.status}</span></td>
                 <td>
                   <div style={{ display: 'flex', gap: '0.5rem' }}>
                     <button className="btn btn-ghost btn-icon btn-sm" onClick={() => setModal(p)}><Edit size={16} /></button>
                     <button className="btn btn-ghost btn-icon btn-sm" style={{ color: '#ef4444' }} onClick={() => { if(confirm('Delete plan?')) deletePlan.mutate(p._id); }}><Trash2 size={16} /></button>
                   </div>
                 </td>
               </tr>
             ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
