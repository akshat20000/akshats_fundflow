import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import useAuthStore from '@/store/useAuthStore';
import useWalletStore from '@/store/useWalletStore';
import ProtectedRoute from '@/components/Layout/ProtectedRoute';

// Pages (lazy-ish — just imported directly for now)
import Landing  from '@/Pages/Landing';
import SignIn   from '@/Pages/Signin';
import SignUp   from '@/Pages/Signup';
import Dashboard from '@/Pages/Dashboard';

export default function App() {
  const { initialize, setUser, fetchProfile } = useAuthStore();
  const { loadAll, reset } = useWalletStore();

  // ── Bootstrap: check session on first load ──
  // useEffect(() => {
  //   initialize();
  // }, [initialize]);

  // ── Listen for auth state changes (across tabs, token refresh, etc.) ──
  // useEffect(() => {
  //   const { data: { subscription } } = supabase.auth.onAuthStateChange(
  //     async (event, session) => {
  //       const user = session?.user ?? null;
  //       setUser(user);

  //       if (event === 'SIGNED_IN' && user) {
  //         await fetchProfile();
  //         await loadAll(user.id);
  //       }

  //       if (event === 'SIGNED_OUT') {
  //         reset();
  //       }
  //     }
  //   );
  //   return () => subscription.unsubscribe();
  // }, [setUser, fetchProfile, loadAll, reset]);

  // Inside App.jsx
useEffect(() => {
  const setupAuth = async () => {
    // 1. Run the initial check
    await initialize(); 

    // 2. Then start listening for changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        const user = session?.user ?? null;
        setUser(user);
        if (user) {
          await fetchProfile();
          await loadAll(user.id);
        }
      }
    );

    return () => subscription.unsubscribe();
  };

  setupAuth();
}, [initialize, setUser, fetchProfile, loadAll]);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/"        element={<Landing />} />
        <Route path="/signin"  element={<SignIn />} />
        <Route path="/signup"  element={<SignUp />} />

        {/* Protected routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}