import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from 'react-query';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';
import { LoginContextProvider } from './store/login-context';
import { UIContextProvider } from './store/ui-context';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
      retry:3,
      refetchOnWindowFocus:false
     // staleTime: 120000
    },
  },
})
ReactDOM.createRoot(document.getElementById('root')).render(
  <QueryClientProvider client={queryClient}>
  <BrowserRouter> 
  <LoginContextProvider>
  <UIContextProvider>

    <App />
    </UIContextProvider>
    </LoginContextProvider>
  </BrowserRouter>
  </QueryClientProvider>,
)
