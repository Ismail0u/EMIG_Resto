// src/main.jsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';


const queryClient = new QueryClient({
  defaultOptions: {
    // On fournit explicitement un objet mutations / queries
    mutations: {
      // ici, tu peux mettre tes options globales (retry, onError, etc.)
    },
    queries: {
      // Garde le cache 5mn, ne refetch pas à chaque remount
      staleTime: 5 * 60 * 1000,
      cacheTime: 10 * 60 * 1000,
      refetchOnWindowFocus: true,
      keepPreviousData: true,
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>
);
