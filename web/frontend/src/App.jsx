import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";




// Responsable guichet
import Dashboard_R from "./pages/pages_rguichet1/dashboard_r";
import Reservation from "./pages/pages_rguichet1/reservations";
import Profile_R from "./pages/pages_rguichet1/profile_r";
import ListeEtudiant from "./pages/pages_rguichet1/listeetudiant";


function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Redirection par défaut */}
          <Route path="/" element={<Navigate to="/login" />} />

          {/* Routes du Responsable Guichet */}
            <Route path="/dashboard_r" element={<Dashboard_R />} />
            <Route path="/reservation" element={<Reservation />} />
            <Route path="/profile_r" element={<Profile_R />} />
            <Route path="/listeetudiant" element={<ListeEtudiant />} />
         
          {/* Route par défaut si aucune correspondance */}
          <Route path="*" element={<Navigate to="/dashboard_r" />} />
        </Routes>
      </AuthProvider>
    </Router> 
  );
}

export default App;
