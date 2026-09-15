import api from './api';
import supabase from './supabaseClient';

export const authService = {
  login: async (email, password) => {
    // 1. Try Backend API first
    try {
      const response = await api.post('/auth/login', { email, password });
      if (response.data?.success && response.data.data?.token) {
        localStorage.setItem('asset_flow_token', response.data.data.token);
        localStorage.setItem('asset_flow_user', JSON.stringify(response.data.data));
        return response.data;
      }
    } catch (apiError) {
      console.warn('[Auth Service] Backend API login attempt:', apiError.message);

      // 2. Direct Supabase Auth fallback if backend is unavailable or timing out
      try {
        const { data: supaData, error: supaError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (!supaError && supaData?.session) {
          const userObj = {
            _id: supaData.user.id,
            id: supaData.user.id,
            name: supaData.user.user_metadata?.name || email.split('@')[0],
            email: supaData.user.email,
            role: supaData.user.user_metadata?.role || 'admin',
            token: supaData.session.access_token,
          };
          localStorage.setItem('asset_flow_token', userObj.token);
          localStorage.setItem('asset_flow_user', JSON.stringify(userObj));
          return { success: true, message: 'Logged in successfully via Supabase', data: userObj };
        }
      } catch (supaErr) {
        console.warn('[Auth Service] Direct Supabase signIn error:', supaErr);
      }

      // Re-throw meaningful error
      throw apiError;
    }
  },

  register: async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      if (response.data?.success && response.data.data?.token) {
        localStorage.setItem('asset_flow_token', response.data.data.token);
        localStorage.setItem('asset_flow_user', JSON.stringify(response.data.data));
        return response.data;
      }
    } catch (apiError) {
      // Direct Supabase signUp fallback
      const { data: supaData, error: supaError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            name: userData.name,
            role: userData.role || 'employee',
          },
        },
      });

      if (!supaError && supaData?.user) {
        const userObj = {
          _id: supaData.user.id,
          id: supaData.user.id,
          name: userData.name,
          email: supaData.user.email,
          role: userData.role || 'employee',
          token: supaData.session?.access_token || 'supabase_pending_session',
        };
        localStorage.setItem('asset_flow_token', userObj.token);
        localStorage.setItem('asset_flow_user', JSON.stringify(userObj));
        return { success: true, message: 'User registered successfully via Supabase', data: userObj };
      }

      throw apiError;
    }
  },

  getMe: async () => {
    try {
      const response = await api.get('/auth/me');
      return response.data;
    } catch (err) {
      // Check current Supabase session
      const { data: sessionData } = await supabase.auth.getSession();
      if (sessionData?.session) {
        const user = sessionData.session.user;
        return {
          success: true,
          data: {
            _id: user.id,
            id: user.id,
            name: user.user_metadata?.name || user.email.split('@')[0],
            email: user.email,
            role: user.user_metadata?.role || 'admin',
          },
        };
      }
      throw err;
    }
  },

  logout: async () => {
    localStorage.removeItem('asset_flow_token');
    localStorage.removeItem('asset_flow_user');
    try {
      await supabase.auth.signOut();
    } catch (err) {
      // Ignore
    }
  },

  getCurrentUser: () => {
    const userStr = localStorage.getItem('asset_flow_user');
    try {
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  },
};

export default authService;
