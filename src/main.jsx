import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { GoogleOAuthProvider } from '@react-oauth/google'

// Replace this with your actual client ID from Google Cloud Console
const GOOGLE_CLIENT_ID = "1069523176165-n99o22e6750jclrhcq697qjnqspu0rjh.apps.googleusercontent.com"

ReactDOM.createRoot(document.getElementById('root')).render(
  <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
    <App />
  </GoogleOAuthProvider>
)