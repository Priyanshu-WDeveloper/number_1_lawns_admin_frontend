import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface AuthUser {
  fullName: string;
  email: string;
  role: number;
  validity: Date;
  profileImage?: string;
}

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  rememberMe: boolean;
}

const STORAGE_KEY = 'auth_state';

function loadFromStorage(): AuthState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    /* ignore */
  }
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    /* ignore */
  }

  return { user: null, token: null, rememberMe: false };
}

function persistToStorage(state: AuthState) {
  const data = JSON.stringify(state);
  if (state.rememberMe) {
    localStorage.setItem(STORAGE_KEY, data);
    sessionStorage.removeItem(STORAGE_KEY);
  } else {
    sessionStorage.setItem(STORAGE_KEY, data);
    localStorage.removeItem(STORAGE_KEY);
  }
}

function clearStorage() {
  localStorage.removeItem(STORAGE_KEY);
  sessionStorage.removeItem(STORAGE_KEY);
}

const initialState: AuthState = loadFromStorage();

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuth(
      state,
      action: PayloadAction<{
        user: Partial<AuthUser>;
        token: string;
        rememberMe?: boolean;
      }>,
    ) {
      state.user = action.payload.user as AuthUser;
      console.log(state.user);

      state.token = action.payload.token;
      state.rememberMe = action.payload.rememberMe ?? false;
      persistToStorage(state);
    },
    clearAuth(state) {
      state.user = null;
      state.token = null;
      state.rememberMe = false;
      clearStorage();
    },
    updateUser(state, action: PayloadAction<Partial<AuthUser>>) {
      if (state.user) {
        Object.assign(state.user, action.payload);
        persistToStorage(state);
      }
    },
  },
});

export const { setAuth, clearAuth, updateUser } = authSlice.actions;
export { loadFromStorage };
export default authSlice.reducer;
