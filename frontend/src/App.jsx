import React, { useState } from 'react'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import './App.css'
import Login from './pages/login'
import Inscription from './pages/inscription'
import Taches from './pages/gestionTaches';
import ActivitesRecentesPage from "./pages/activitesRecentesPage";
import { FiBell } from "react-icons/fi";

function App() {
  const [notification, setNotification] = useState('');
  const [showNotif, setShowNotif] = useState(false);

  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/connexion" element={<Login />} />
          <Route path="/inscription" element={<Inscription />} />
          <Route path="/taches" element={<Taches setNotification={setNotification} />} />
          <Route path="/activites-recentes" element={<ActivitesRecentesPage />} />
        </Routes>
      </Router>
      <div className="fixed top-4 left-4 z-50">
        <button
          onClick={() => setShowNotif(!showNotif)}
          className="relative"
          title="Notifications"
        >
          <FiBell size={28} className="text-yellow-600" />
          {notification && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full px-2 text-xs">1</span>
          )}
        </button>
        {showNotif && notification && (
          <div className="bg-green-500 text-white px-4 py-2 rounded shadow mt-2">
            {notification}
          </div>
        )}
      </div>
    </>
  )
}

export default App
