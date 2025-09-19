import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import TombolasPage from './pages/TombolasPage';
import TombolaDetailPage from './pages/TombolaDetailPage';
import ParticipatePage from './pages/ParticipatePage';
import MyParticipationsPage from './pages/MyParticipationsPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminTombolas from './pages/admin/AdminTombolas';
import AdminParticipations from './pages/admin/AdminParticipations';
import AdminUsers from './pages/admin/AdminUsers';
import AdminStats from './pages/admin/AdminStats';
import AdminContact from './pages/admin/AdminContact';

// Layouts
import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';
import AdminLayout from './layouts/AdminLayout';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            {/* Routes publiques */}
            <Route path="/" element={<MainLayout />}>
              <Route index element={<HomePage />} />
              <Route path="tombolas" element={<TombolasPage />} />
              <Route path="tombolas/:id" element={<TombolaDetailPage />} />
            </Route>

            {/* Routes d'authentification */}
            <Route path="/auth" element={<AuthLayout />}>
              <Route path="login" element={<LoginPage />} />
              <Route path="register" element={<RegisterPage />} />
            </Route>

            {/* Routes protégées utilisateur */}
            <Route path="/user" element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
              <Route path="profile" element={<ProfilePage />} />
              <Route path="participations" element={<MyParticipationsPage />} />
              <Route path="tombolas/:id/participate" element={<ParticipatePage />} />
            </Route>

            {/* Routes admin */}
            <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
              <Route index element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="tombolas" element={<AdminTombolas />} />
              <Route path="participations" element={<AdminParticipations />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="contact" element={<AdminContact />} />
              <Route path="stats" element={<AdminStats />} />
            </Route>

            {/* Route de redirection */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
        
        {/* Toast notifications */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: '#22c55e',
                secondary: '#fff',
              },
            },
            error: {
              duration: 5000,
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
      </Router>
    </AuthProvider>
  );
}

export default App;
