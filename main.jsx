import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Vector from './Vector.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        {/* Route mengatur halaman mana yang muncul berdasarkan URL */}
        <Route path="/" element={<Vector />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
)
