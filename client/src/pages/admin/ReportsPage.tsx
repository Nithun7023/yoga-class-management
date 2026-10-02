import { useQuery } from '@tanstack/react-query';
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';
import { Download } from 'lucide-react';
import api from '../../lib/api';
import { formatCurrency } from '../../lib/utils';

const COLORS = ['#14b8a6', '#0891b2', '#8b5cf6', '#f59e0b', '#ef4444'];
const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="chart-wrapper">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <p className="chart-title">{title}</p>
        <button className="btn btn-ghost btn-sm"><Download size={14} /> CSV</button>
      </div>
      {children}
    </div>
  );
}

export default function ReportsPage() {
  const { data: revenueData, isLoading: rvLoading } = useQuery({
    queryKey: ['report-revenue'],
    queryFn: () => api.get('/reports/revenue').then(r => r.data.data),
  });

  const { data: memberData, isLoading: mLoading } = useQuery({
    queryKey: ['report-members'],
    queryFn: () => api.get('/reports/members').then(r => r.data.data),
  });

  const { data: attendanceData } = useQuery({
    queryKey: ['report-attendance'],
    queryFn: () => api.get('/reports/attendance').then(r => r.data.data),
  });

  const { data: classData } = useQuery({
    queryKey: ['report-classes'],
    queryFn: () => api.get('/reports/classes').then(r => r.data.data),
  });

  const monthlyRevenue = revenueData?.monthly?.map((d: any) => ({
    month: MONTH_NAMES[d._id.month - 1],
    revenue: d.revenue,
    count: d.count,
  })) || [];

  const memberGrowth = memberData?.monthly?.map((d: any) => ({
    month: MONTH_NAMES[d._id.month - 1],
    newMembers: d.newMembers,
  })) || [];

  const memberStatus = memberData?.activeVsInactive?.map((d: any) => ({
    name: d._id.charAt(0).toUpperCase() + d._id.slice(1),
    value: d.count,
  })) || [];

  const attendanceSummary = attendanceData?.summary?.map((d: any) => ({
    name: d._id.charAt(0).toUpperCase() + d._id.slice(1),
    value: d.count,
  })) || [];

  const classByPaymentMethod = revenueData?.byMethod?.map((d: any) => ({
    method: d._id,
    revenue: d.revenue,
  })) || [];

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>Reports</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>Analytics & performance insights</p>
        </div>
      </div>

      {/* Revenue summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem' }}>
        {[
          { label: 'Total Revenue', value: formatCurrency(revenueData?.total?.total || 0), color: '#14b8a6' },
          { label: 'Total Payments', value: revenueData?.total?.count || 0, color: '#0891b2' },
          { label: 'Expiring in 7d', value: attendanceData?.summary ? '—' : '—', color: '#f59e0b' },
        ].map(({ label, value, color }) => (
          <div key={label} className="card card-sm" style={{ borderLeft: `3px solid ${color}` }}>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>{label}</p>
            <p style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '0.25rem' }}>{value}</p>
          </div>
        ))}
      </div>

      {/* Charts grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem' }}>
        <ChartCard title="📊 Monthly Revenue">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={monthlyRevenue}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: 'var(--text-muted)' }} />
              <YAxis tickFormatter={(v) => `₹${v / 1000}k`} tick={{ fontSize: 12, fill: 'var(--text-muted)' }} />
              <Tooltip formatter={(v: any) => formatCurrency(v)} contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8 }} />
              <Bar dataKey="revenue" fill="#14b8a6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="👥 Member Growth">
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={memberGrowth}>
              <defs>
                <linearGradient id="memberGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#14b8a6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: 'var(--text-muted)' }} />
              <YAxis tick={{ fontSize: 12, fill: 'var(--text-muted)' }} />
              <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8 }} />
              <Area type="monotone" dataKey="newMembers" stroke="#14b8a6" fill="url(#memberGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="🧘 Attendance Breakdown">
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={attendanceSummary} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                {attendanceSummary.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8 }} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="💳 Revenue by Payment Method">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={classByPaymentMethod}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="method" tick={{ fontSize: 12, fill: 'var(--text-muted)' }} />
              <YAxis tickFormatter={(v) => `₹${v / 1000}k`} tick={{ fontSize: 12, fill: 'var(--text-muted)' }} />
              <Tooltip formatter={(v: any) => formatCurrency(v)} contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8 }} />
              <Bar dataKey="revenue" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Most booked classes */}
      {classData?.mostBooked && (
        <div>
          <h2 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.75rem', color: 'var(--text-primary)' }}>🏆 Most Popular Classes</h2>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr><th>Class</th><th>Type</th><th>Total Bookings</th></tr>
              </thead>
              <tbody>
                {classData.mostBooked.map((c: any, i: number) => (
                  <tr key={c._id}>
                    <td style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontSize: '1.25rem' }}>{['🥇','🥈','🥉','4️⃣','5️⃣'][i]}</span> {c.name}
                    </td>
                    <td><span className="badge badge-teal">{c.type}</span></td>
                    <td style={{ fontWeight: 600 }}>{c.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
