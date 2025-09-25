import React from 'react'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import './App.css'
import Login from './pages/login'
import Inscription from './pages/inscription'
import GestionTaches from './pages/gestionTaches'

function App() {

  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/connexion" element={<Login />} />
          <Route path="/inscription" element={<Inscription />} />
          <Route path="/taches" element={<GestionTaches />} />
        </Routes>
      </Router>
    </>
  )
}

export default App
