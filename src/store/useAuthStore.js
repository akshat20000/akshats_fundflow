import { create } from 'zustand';
import { supabase } from '@/lib/supabase';

const useAuthStore = create((set, get) => ({
  user:    null,
  profile: null,
  loading: true,   // true until first auth check completes
  error:   null,

  // ── Set user from session ──
  setUser: (user) => set({ user }),

  // ── Initialize — call once at app startup ──
  initialize: async () => {
    set({ loading: true });
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user ?? null;
      set({ user, loading: false });

      if (user) {
        await get().fetchProfile();
      }
    } catch {
      set({ user: null, loading: false });
    }
  },

  // ── Sign In ──
  signIn: async (email, password) => {
    set({ error: null });
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      set({ error: error.message });
      return { success: false, error: error.message };
    }
    set({ user: data.user });
    await get().fetchProfile();
    return { success: true };
  },

  // ── Sign Up ──
  signUp: async (email, password, username) => {
    set({ error: null });
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { username } },
    });
    if (error) {
      set({ error: error.message });
      return { success: false, error: error.message };
    }
    // If session exists email confirmation is off
    if (data.session) {
      set({ user: data.user });
      await get().fetchProfile();
      return { success: true, confirmed: true };
    }
    // Email confirmation required
    return { success: true, confirmed: false, email };
  },

  // ── Sign Out ──
  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null, profile: null });
  },

  // ── Fetch profile ──
  fetchProfile: async () => {
    const { user } = get();
    if (!user) return;

    const { data, error } = await supabase
      .from('profiles')
      .select('id, username, email, full_name, phone_number, balance')
      .eq('id', user.id)
      .maybeSingle();

    if (!error && data) {
      // If profile missing username, backfill from auth metadata
      if (!data.username && user.user_metadata?.username) {
        await supabase
          .from('profiles')
          .update({ username: user.user_metadata.username })
          .eq('id', user.id);
        data.username = user.user_metadata.username;
      }
      set({ profile: { ...data, email: data.email || user.email } });
    }
  },

  // ── Update profile ──
  updateProfile: async (updateData) => {
    const { user } = get();
    if (!user) return { success: false, error: 'Not logged in' };

    const { data, error } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', user.id)
      .select()
      .single();

    if (error) return { success: false, error: error.message };
    set({ profile: data });
    return { success: true };
  },

  clearError: () => set({ error: null }),
}));

export default useAuthStore;