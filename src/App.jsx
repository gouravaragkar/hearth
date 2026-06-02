import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import { HomeProvider } from '@/context/HomeContext';
import ThemeProvider from '@/lib/ThemeProvider';
import Layout from '@/components/Layout';
import Login from '@/pages/Login';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isAuthenticated } = useAuth();

  // Show loading spinner while checking auth
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

  // Show login page if not authenticated
  if (!isAuthenticated) {
    return <Login />;
  }

  // Show the app if authenticated
  return (
    <HomeProvider>
      <Routes>
        <Route path="/" element={<Layout />} />
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
          <AuthProvider>
            <AuthenticatedApp />
          </AuthProvider>
        </Router>
        <Toaster />
      </QueryClientProvider>
    </ThemeProvider>
  )
}

export default App