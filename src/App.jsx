import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Sidebar from './components/Layout/Sidebar';

// Admin Pages
import AdminDashboard from './pages/Admin/Dashboard';
import AdminInvestors from './pages/Admin/Investors';
import AdminStartups from './pages/Admin/Startups';
import AdminRounds from './pages/Admin/Rounds';
import AdminMatchmaking from './pages/Admin/Matchmaking';

// Investor Pages
import InvestorDashboard from './pages/Investor/Dashboard';
import InvestorSelections from './pages/Investor/Selections';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, profile, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-6">
        <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-500 text-sm animate-pulse">Initializing platform security...</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-8 text-xs text-slate-600 hover:text-slate-400 underline"
        >
          Taking too long? Click to refresh
        </button>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && (!profile || !allowedRoles.includes(profile.role))) {
    // If they have no role or wrong role, send them to their natural home or login
    if (!profile) return <Navigate to="/login" replace />;
    return <Navigate to={profile.role === 'admin' ? '/admin' : '/investor'} replace />;
  }

  return children;
};

const Layout = ({ children }) => {
  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-200">
      <Sidebar />
      <main className="flex-1 ml-64 p-8">
        {children}
      </main>
    </div>
  );
};

function AppRoutes() {
  const { user, profile, loading } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={
        // Only redirect if we have a user AND their profile is loaded
        (user && profile)
          ? <Navigate to={profile.role === 'admin' ? '/admin' : '/investor'} replace />
          : <Login />
      } />

      {/* Admin Routes */}
      <Route path="/admin" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <Layout><AdminDashboard /></Layout>
        </ProtectedRoute>
      } />
      <Route path="/admin/investors" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <Layout><AdminInvestors /></Layout>
        </ProtectedRoute>
      } />
      <Route path="/admin/startups" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <Layout><AdminStartups /></Layout>
        </ProtectedRoute>
      } />
      <Route path="/admin/rounds" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <Layout><AdminRounds /></Layout>
        </ProtectedRoute>
      } />
      <Route path="/admin/matchmaking" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <Layout><AdminMatchmaking /></Layout>
        </ProtectedRoute>
      } />

      {/* Investor Routes */}
      <Route path="/investor" element={
        <ProtectedRoute allowedRoles={['investor']}>
          <Layout><InvestorDashboard /></Layout>
        </ProtectedRoute>
      } />
      <Route path="/investor/selections" element={
        <ProtectedRoute allowedRoles={['investor']}>
          <Layout><InvestorSelections /></Layout>
        </ProtectedRoute>
      } />

      {/* Fallback */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
