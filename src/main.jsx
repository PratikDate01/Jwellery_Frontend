import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { AuthProvider } from './context/AuthContext'
import { GoldRateProvider } from './context/GoldRateContext'
import { Toaster } from 'react-hot-toast'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      retry: (failureCount, error) => {
        // Don't retry for certain errors
        if (error?.response?.status === 401 || error?.response?.status === 403 || error?.response?.status === 404) {
          return false;
        }
        // Max 2 retries
        return failureCount < 2;
      },
      refetchOnWindowFocus: false, 
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 0, // No retries for mutations (e.g. login, post) to prevent duplicate actions or loops
    }
  },
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <GoldRateProvider>
          <App />
          <Toaster position="bottom-right" />
        </GoldRateProvider>
      </AuthProvider>
    </QueryClientProvider>
  </React.StrictMode>,
)
