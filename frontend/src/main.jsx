import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from '@asgardeo/auth-react'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider
        config={{
          clientID: 'jTLOfb644OOKMz2rQgO_DieoFV4a',
          baseUrl: 'https://api.asgardeo.io/t/utexas',
          signInRedirectURL: 'https://lab10-frontend-8l47.onrender.com',
          signOutRedirectURL: 'https://lab10-frontend-8l47.onrender.com',
          scope: ['openid', 'profile'],
        }}
      >
        <App />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
