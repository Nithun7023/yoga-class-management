import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Check, X, Search } from 'lucide-react';
import api from '../../lib/api';
import { formatDate, getStatusBadge } from '../../lib/utils';

export default function InstructorAttendancePage() {
  const qc = useQueryClient();
  const [selectedClass, setSelectedClass] = useState('');
  
  const { data: classesData } = useQuery({
    queryKey: ['instructor-classes-today'],
    queryFn: () => api.get('/classes', { params: { limit: 50, sort: '-date' } }).then(r => r.data.data),
  });

  const { data: attendanceData, isLoading } = useQuery({
    queryKey: ['class-attendance', selectedClass],
    queryFn: () => api.get('/attendance', { params: { classId: selectedClass, limit: 100 } }).then(r => r.data.data),
    enabled: !!selectedClass,
  });

  const markAttendance = useMutation({
    mutationFn: ({ bookingId, memberId, status }: { bookingId: string, memberId: string, status: string }) => 
      api.post('/attendance', { bookingId, classId: selectedClass, memberId, status }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['class-attendance', selectedClass] }),
  });

  const classes = classesData || [];
  const attendanceList = attendanceData || [];

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>Mark Attendance</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Record student presence for your classes</p>
      </div>

      <div className="card card-sm">
        <label className="label">Select Class</label>
        <select className="input" value={selectedClass} onChange={e => setSelectedClass(e.target.value)}>
          <option value="">-- Choose a class --</option>
          {classes.map((c: any) => (
            <option key={c._id} value={c._id}>
              {formatDate(c.date)} - {c.name} ({c.bookedCount} booked)
            </option>
          ))}
        </select>
      </div>

      {selectedClass && (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Student</th>
                <th>Booking Status</th>
                <th>Attendance</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? <tr><td colSpan={4} style={{ textAlign: 'center', padding: '2rem' }}>Loading roster...</td></tr> :
               attendanceList.length === 0 ? <tr><td colSpan={4} style={{ textAlign: 'center', padding: '2rem' }}>No bookings for this class.</td></tr> :
               attendanceList.map((a: any) => {
                 const student = typeof a.memberId === 'object' ? a.memberId : { name: 'Unknown' };
                 // Normally we'd fetch bookings for the class and join, but assuming attendance records are pre-initialized or we fetch bookings instead
                 return (
                   <tr key={a._id}>
                     <td style={{ fontWeight: 500 }}>{student.name}</td>
                     <td><span className="badge badge-green">Confirmed</span></td>
                     <td><span className={`badge ${getStatusBadge(a.status)}`}>{a.status || 'Pending'}</span></td>
                     <td>
                       <div style={{ display: 'flex', gap: '0.5rem' }}>
                         <button className="btn btn-secondary btn-sm" onClick={() => markAttendance.mutate({ bookingId: a.bookingId, memberId: student._id, status: 'present' })}>
                           <Check size={14} style={{ color: '#16a34a' }} /> Present
                         </button>
                         <button className="btn btn-secondary btn-sm" onClick={() => markAttendance.mutate({ bookingId: a.bookingId, memberId: student._id, status: 'absent' })}>
                           <X size={14} style={{ color: '#ef4444' }} /> Absent
                         </button>
                       </div>
                     </td>
                   </tr>
                 );
               })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
