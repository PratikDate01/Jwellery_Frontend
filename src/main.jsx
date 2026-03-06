import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { AuthProvider } from './context/AuthContext'
import { GoldRateProvider } from './context/GoldRateContext'
import { Toaster } from 'react-hot-toast'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient()

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
