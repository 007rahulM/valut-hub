import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'   // <-- THIS LINE MUST EXIST
import App from './App'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)