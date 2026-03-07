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
      staleTime: 5 * 60 * 1000, 
      gcTime: 10 * 60 * 1000, 
      retry: (failureCount, error) => {
        // Stop retrying on standard auth errors
        if (error?.response?.status === 401 || error?.response?.status === 403 || error?.response?.status === 404) {
          return false;
        }
        
        // Retry for timeouts or network errors (potentially cold starts)
        // Max 3 retries for queries to give backend ~1.5-2 mins to wake up
        return failureCount < 3;
      },
      // Give the backend time to wake up between retries
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      refetchOnWindowFocus: false, 
      refetchOnReconnect: true,
      throwOnError: false, // Don't crash the whole app on query error
    },
    mutations: {
      retry: 0, // No retries for destructive actions (POST/PUT/DELETE)
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
