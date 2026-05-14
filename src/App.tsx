import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import AppRoutes from './routes/app-routes';
import { Toaster } from 'react-hot-toast';

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <AppRoutes />
        <Toaster
          position="top-right"
          // toastOptions={{
          //   style: {
          //     background: '#22c55e',
          //     color: '#fff',
          //   },
          // }}
        />
      </BrowserRouter>
    </Provider>
  );
};

export default App;
