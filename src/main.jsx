import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'

const host = window.location.hostname
const isPublicDomain = host === 'aloharvparkfl.com' || host === ('www.' + 'aloharvparkfl.com')

function SimplePage() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'system-ui, -apple-system, sans-serif',
    }}>
      <h1 style={{ fontSize: 32, fontWeight: 600, color: '#111' }}>Aloha RV Park</h1>
    </div>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {isPublicDomain ? <SimplePage /> : <App />}
  </React.StrictMode>,
)
