import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
import AppLayout from './components/AppLayout';

// Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardRedirect from './pages/DashboardRedirect';

// Admin
import AdminDashboard from './pages/admin/AdminDashboard';
import MembersPage from './pages/admin/MembersPage';
import ClassesPage from './pages/admin/ClassesPage';
import BookingsPage from './pages/admin/BookingsPage';
import ReportsPage from './pages/admin/ReportsPage';
import MembershipPlansPage from './pages/admin/MembershipPlansPage';

// Member
import MemberDashboard from './pages/member/MemberDashboard';
import BrowseClassesPage from './pages/member/BrowseClassesPage';

// Instructor
import InstructorDashboard from './pages/instructor/InstructorDashboard';
import InstructorAttendancePage from './pages/instructor/AttendancePage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30000,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              {/* Public routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              {/* Role redirect */}
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <DashboardRedirect />
                </ProtectedRoute>
              } />

              {/* Admin routes */}
              <Route path="/admin" element={
                <ProtectedRoute roles={['admin']}>
                  <AppLayout />
                </ProtectedRoute>
              }>
                <Route index element={<Navigate to="/admin/dashboard" replace />} />
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="members" element={<MembersPage />} />
                <Route path="classes" element={<ClassesPage />} />
                <Route path="bookings" element={<BookingsPage />} />
                <Route path="reports" element={<ReportsPage />} />
                {/* Placeholder routes for remaining admin pages */}
                <Route path="instructors" element={<MembersPage />} />
                <Route path="attendance" element={<BookingsPage />} />
                <Route path="plans" element={<MembershipPlansPage />} />
                <Route path="memberships" element={<AdminDashboard />} />
                <Route path="payments" element={<AdminDashboard />} />
                <Route path="settings" element={<AdminDashboard />} />
              </Route>

              {/* Instructor routes */}
              <Route path="/instructor" element={
                <ProtectedRoute roles={['instructor']}>
                  <AppLayout />
                </ProtectedRoute>
              }>
                <Route index element={<Navigate to="/instructor/dashboard" replace />} />
                <Route path="dashboard" element={<InstructorDashboard />} />
                <Route path="classes" element={<ClassesPage />} />
                <Route path="students" element={<MembersPage />} />
                <Route path="attendance" element={<InstructorAttendancePage />} />
              </Route>

              {/* Member routes */}
              <Route path="/member" element={
                <ProtectedRoute roles={['member']}>
                  <AppLayout />
                </ProtectedRoute>
              }>
                <Route index element={<Navigate to="/member/dashboard" replace />} />
                <Route path="dashboard" element={<MemberDashboard />} />
                <Route path="browse" element={<BrowseClassesPage />} />
                <Route path="bookings" element={<BookingsPage />} />
                <Route path="membership" element={<MemberDashboard />} />
                <Route path="attendance" element={<BookingsPage />} />
              </Route>

              {/* Default */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
