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
      staleTime: 10 * 60 * 1000, // Increase to 10 mins - dashboard data doesn't change every second
      gcTime: 30 * 60 * 1000, // Keep in cache for 30 mins
      retry: (failureCount, error) => {
        // Don't retry for client errors
        if (error?.response?.status >= 400 && error?.response?.status < 500) {
          return false;
        }
        
        // Max 1 retry for most queries to avoid spamming a cold backend
        // If it fails twice, it's likely a real issue or very slow cold start
        return failureCount < 1;
      },
      // Linear delay for retries
      retryDelay: 2000,
      refetchOnWindowFocus: false, 
      refetchOnReconnect: true,
      throwOnError: false, 
    },
    mutations: {
      retry: 0,
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
