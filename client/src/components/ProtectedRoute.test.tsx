import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AuthContext } from '../contexts/AuthContext';
import ProtectedRoute from './ProtectedRoute';
import { MemoryRouter, Routes, Route } from 'react-router-dom';

describe('ProtectedRoute', () => {
  it('redirects to login when unauthenticated', () => {
    const mockContext = { user: null, isAuthenticated: false, login: vi.fn(), logout: vi.fn(), isLoading: false };
    
    render(
      <AuthContext.Provider value={mockContext}>
        <MemoryRouter initialEntries={['/dashboard']}>
          <Routes>
            <Route path="/login" element={<div>Login Page</div>} />
            <Route path="/dashboard" element={<ProtectedRoute><p>Secret</p></ProtectedRoute>} />
          </Routes>
        </MemoryRouter>
      </AuthContext.Provider>
    );
    
    expect(screen.getByText('Login Page')).toBeDefined();
  });

  it('renders content when authenticated', () => {
    const mockContext = { 
      user: { _id: '1', name: 'Test', email: 'test@example.com', role: 'member' as const }, 
      isAuthenticated: true, 
      login: vi.fn(), 
      logout: vi.fn(), 
      isLoading: false 
    };
    
    render(
      <AuthContext.Provider value={mockContext}>
        <MemoryRouter initialEntries={['/dashboard']}>
          <Routes>
            <Route path="/dashboard" element={<ProtectedRoute><p>Secret</p></ProtectedRoute>} />
          </Routes>
        </MemoryRouter>
      </AuthContext.Provider>
    );
    
    expect(screen.getByText('Secret')).toBeDefined();
  });
});
