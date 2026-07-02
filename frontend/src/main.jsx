import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            fontFamily: "'Inter', sans-serif",
            fontSize: '0.875rem',
            borderRadius: '8px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.14)',
            padding: '12px 16px',
            maxWidth: '380px',
          },
          success: {
            iconTheme: { primary: '#16a34a', secondary: '#fff' },
            style: {
              background: '#f0fdf4',
              color: '#14532d',
              border: '1px solid #bbf7d0',
            },
          },
          error: {
            iconTheme: { primary: '#dc2626', secondary: '#fff' },
            style: {
              background: '#fef2f2',
              color: '#7f1d1d',
              border: '1px solid #fecaca',
            },
          },
          loading: {
            style: {
              background: '#eff6ff',
              color: '#1e3a8a',
              border: '1px solid #bfdbfe',
            },
          },
        }}
      />
    </BrowserRouter>
  </StrictMode>,
)