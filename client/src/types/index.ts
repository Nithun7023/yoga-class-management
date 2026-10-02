export type UserRole = 'admin' | 'instructor' | 'member';
export type UserStatus = 'active' | 'inactive' | 'suspended';

export interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  role: UserRole;
  status: UserStatus;
  avatar?: string | null;
  emergencyContact?: {
    name?: string;
    phone?: string;
    relationship?: string;
  };
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

export type YogaType =
  | 'Hatha' | 'Vinyasa' | 'Ashtanga' | 'Yin'
  | 'Power Yoga' | 'Restorative' | 'Prenatal' | 'Meditation' | 'Beginner Yoga';

export type Difficulty = 'Beginner' | 'Intermediate' | 'Advanced';

export type FocusArea =
  | 'Flexibility' | 'Strength' | 'Mobility' | 'Relaxation'
  | 'Stress Relief' | 'Balance' | 'Core';

export type ClassStatus = 'scheduled' | 'ongoing' | 'completed' | 'cancelled';

export interface YogaClass {
  _id: string;
  name: string;
  type: YogaType;
  description?: string;
  difficulty: Difficulty;
  focusArea: FocusArea[];
  instructorId: User | string;
  room?: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: number;
  capacity: number;
  bookedCount: number;
  availableSlots: number;
  isFull: boolean;
  status: ClassStatus;
  isRecurring: boolean;
  image?: string | null;
  createdAt: string;
  updatedAt: string;
}

export type BookingStatus = 'confirmed' | 'cancelled' | 'waitlisted' | 'completed';

export interface Booking {
  _id: string;
  memberId: User | string;
  classId: YogaClass | string;
  bookingDate: string;
  status: BookingStatus;
  cancelledAt?: string;
  cancellationReason?: string;
  cancelledBy?: User | string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type AttendanceStatus = 'present' | 'absent' | 'late' | 'cancelled';

export interface Attendance {
  _id: string;
  bookingId: Booking | string;
  memberId: User | string;
  classId: YogaClass | string;
  status: AttendanceStatus;
  markedBy: User | string;
  markedAt: string;
  notes?: string;
}

export interface MembershipPlan {
  _id: string;
  name: string;
  duration: number;
  price: number;
  classLimit: number | null;
  description?: string;
  features?: string[];
  status: 'active' | 'inactive';
  createdAt: string;
}

export type MembershipStatus = 'active' | 'expired' | 'cancelled' | 'pending';

export interface Membership {
  _id: string;
  memberId: User | string;
  planId: MembershipPlan | string;
  startDate: string;
  endDate: string;
  amount: number;
  status: MembershipStatus;
  classesUsed: number;
  notes?: string;
  createdAt: string;
}

export type PaymentMethod = 'Cash' | 'UPI' | 'Card' | 'Bank Transfer';
export type PaymentStatus = 'paid' | 'pending' | 'failed' | 'refunded';

export interface Payment {
  _id: string;
  memberId: User | string;
  membershipId: Membership | string;
  amount: number;
  paymentMethod: PaymentMethod;
  transactionReference?: string;
  paymentDate: string;
  status: PaymentStatus;
  notes?: string;
  createdAt: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}
