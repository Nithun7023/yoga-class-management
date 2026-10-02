import { clsx, type ClassValue } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatDate(date: string | Date, options?: Intl.DateTimeFormatOptions): string {
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    ...options,
  }).format(new Date(date));
}

export function formatTime(time: string): string {
  const [hours, minutes] = time.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const h = hours % 12 || 12;
  return `${h}:${minutes.toString().padStart(2, '0')} ${period}`;
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function getStatusBadge(status: string): string {
  const map: Record<string, string> = {
    active: 'badge-green',
    confirmed: 'badge-green',
    paid: 'badge-green',
    present: 'badge-green',
    scheduled: 'badge-teal',
    completed: 'badge-blue',
    pending: 'badge-yellow',
    waitlisted: 'badge-yellow',
    late: 'badge-yellow',
    inactive: 'badge-gray',
    cancelled: 'badge-red',
    expired: 'badge-red',
    failed: 'badge-red',
    absent: 'badge-red',
    suspended: 'badge-red',
  };
  return map[status] ?? 'badge-gray';
}

export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}
