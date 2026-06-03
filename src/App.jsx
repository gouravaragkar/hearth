import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import { HomeProvider } from '@/context/HomeContext';
import ThemeProvider from '@/lib/ThemeProvider';
import Layout from '@/components/Layout';
import Login from '@/pages/Login';
import LandingPage from '@/pages/LandingPage';
import PrivacyPolicy from '@/pages/PrivacyPolicy';
import Changelog from '@/pages/Changelog';

// Root: authenticated → dashboard, unauthenticated → landing page
const RootRoute = () => {
  const { isLoadingAuth, isAuthenticated } = useAuth();
  if (isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <span className="text-4xl">🏡</span>
          <div className="w-6 h-6 border-3 border-muted border-t-primary rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }
  return isAuthenticated ? <Layout /> : <LandingPage />;
};

// Protected app routes — redirect to /login if not authenticated
const AuthenticatedApp = () => {
  const { isLoadingAuth, isAuthenticated } = useAuth();

  if (isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <span className="text-4xl">🏡</span>
          <div className="w-6 h-6 border-3 border-muted border-t-primary rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <HomeProvider>
      <Routes>
        <Route path="/recurring" element={<Layout />} />
        <Route path="/one-time" element={<Layout />} />
        <Route path="/calendar" element={<Layout />} />
        <Route path="/homes" element={<Layout />} />
        <Route path="/assistant" element={<Layout />} />
        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </HomeProvider>
  );
};

function App() {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <Routes>
            {/* Fully public routes */}
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/changelog" element={<Changelog />} />
            <Route path="/login" element={<Login />} />

            {/* Root: smart — shows landing or dashboard based on auth */}
            <Route path="/" element={
              <AuthProvider>
                <HomeProvider>
                  <RootRoute />
                </HomeProvider>
              </AuthProvider>
            } />

            {/* All other app routes — require auth */}
            <Route path="*" element={
              <AuthProvider>
                <AuthenticatedApp />
              </AuthProvider>
            } />
          </Routes>
        </Router>
        <Toaster />
      </QueryClientProvider>
    </ThemeProvider>
  )
}

export default App
