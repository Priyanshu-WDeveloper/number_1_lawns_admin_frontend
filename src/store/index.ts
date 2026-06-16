import { configureStore } from '@reduxjs/toolkit';
import { api } from '@/API/api';
import authReducer, { loadFromStorage } from './auth-slice';

export const store = configureStore({
  reducer: {
    [api.reducerPath]: api.reducer,
    auth: authReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['api/executeQuery/fulfilled'],
        ignoredPaths: ['api.queries'],
      },
    }).concat(api.middleware),
  preloadedState: {
    auth: loadFromStorage(),
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
