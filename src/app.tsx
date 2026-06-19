import { useEffect, useState } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import AppRoutes from './routes/app-routes';
import { Toaster } from 'react-hot-toast';
import { ErrorBoundary } from './components/error-boundary';
import { loadAppConstants } from '@/lib/appData';

const LoadingScreen = () => (
  <div className="flex h-screen w-screen items-center justify-center bg-[#F4F7EF]">
    <div className="flex flex-col items-center gap-4">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#16610E] border-t-transparent" />
      <p className="text-sm text-[#777]">Loading...</p>
    </div>
  </div>
);

const App = () => {
  const [configLoaded, setConfigLoaded] = useState(false);

  useEffect(() => {
    loadAppConstants().finally(() => setConfigLoaded(true));
  }, []);

  if (!configLoaded) {
    return <LoadingScreen />;
  }

  return (
    <Provider store={store}>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <ErrorBoundary>
          <AppRoutes />
        </ErrorBoundary>
        <Toaster position="top-right" />
      </BrowserRouter>
    </Provider>
  );
};

export default App;
