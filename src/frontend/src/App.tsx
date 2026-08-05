import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';
import { AuthProvider } from './context/AuthContext';
import { UserRole } from './constants/enums';

// Layout & Guards
import { AppLayout } from './components/layout/AppLayout';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { NotFoundPage } from './pages/NotFoundPage';
import { UnauthorizedPage } from './pages/UnauthorizedPage';

// Features
import { LoginPage } from './features/auth/LoginPage';
import { CustomerDashboardPage } from './features/orders/pages/CustomerDashboardPage';
import { NewOrderPage } from './features/orders/pages/NewOrderPage';
import { TrackingPage } from './features/shipments/pages/TrackingPage';
import { CustomerTrackingPage } from './features/shipments/pages/CustomerTrackingPage';
import { StaffDashboardPage } from './features/fleet/pages/StaffDashboardPage';
import { ReportsPage } from './features/reports/pages/ReportsPage';
import { DriverDashboardPage } from './features/shipments/pages/DriverDashboardPage';

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/unauthorized" element={<UnauthorizedPage />} />
            
            {/* Base redirect to login */}
            <Route path="/" element={<Navigate to="/login" replace />} />

            {/* Protected Routes Wrapper */}
            <Route element={<AppLayout />}>
              {/* Customer Routes */}
              <Route element={<ProtectedRoute roles={[UserRole.CUSTOMER]} />}>
                <Route path="/customer" element={<CustomerDashboardPage />} />
                <Route path="/customer/new-order" element={<NewOrderPage />} />
                <Route path="/customer/tracking" element={<CustomerTrackingPage />} />
                <Route path="/customer/orders/:orderId/tracking" element={<TrackingPage />} />
              </Route>

              {/* Staff & Admin Routes */}
              <Route element={<ProtectedRoute roles={[UserRole.STAFF, UserRole.ADMIN]} />}>
                <Route path="/staff" element={<StaffDashboardPage />} />
                <Route path="/staff/reports" element={<ReportsPage />} />
              </Route>

              {/* Driver Routes */}
              <Route element={<ProtectedRoute roles={[UserRole.DRIVER]} />}>
                <Route path="/driver" element={<DriverDashboardPage />} />
              </Route>
            </Route>

            {/* Catch-all 404 */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
