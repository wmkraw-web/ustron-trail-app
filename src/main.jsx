import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'

// Jeśli nie masz pliku index.css, Vite to po prostu zignoruje
// Ale dla pewności usuniemy ten import, a cały Tailwind obsłużymy w App.jsx 
// poprzez cdn, jeśli nie instalowałeś tailwinda lokalnie. 
// Standardowo Vite wymagałoby lokalnego Tailwinda.

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
