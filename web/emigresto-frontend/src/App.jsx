// src/App.jsx
import { toast } from 'react-hot-toast'
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Header from './layout/Header'

// Sidebars & datas Guichet
import Sidebar from './layout/Sidebar'
import { menuItems as menuR, userOptions as userR } from './layout/Layout_R/SidebarData_R'

// Sidebars & datas Vendeur
import { menuItems as menuV, userOptions as userV } from './layout/Layout_V/SidebarData_V'

// Pages Guichet
import DashboardGuichet from './pages/Guichet/DashboardGuichet'
import Reservation from './pages/Guichet/Reservation'
import StudentList from './pages/Guichet/StudentList'
import Profile_R from './pages/Guichet/Profile_R'

// Pages Vendeur
import DashboardVendeur from './pages/Dashboard'
import SellTicket from './pages/SellTicket'
import History from './pages/History'
import Profile_V from './pages/Profile_V'

// Auth
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'

/** Route protégée : redirige vers login si non-connecté */
function PrivateRoute({ children }) {
  const { user, loading } = useAuth()
  const loc = useLocation()
  if (loading) return null
  if (!user) {
    toast.info('Veuillez vous connecter')
    return <Navigate to="/login" state={{ from: loc }} replace />
  }
  return children
}

/** Route publique : redirige vers home si déjà connecté */
function PublicRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return null
  if (user) {
    toast.success('Vous êtes déjà connecté')
    return <Navigate to="/" replace />
  }
  return children
}

/** Layout commun pour le Guichet */
function GuichetLayout({ title, children }) {
  return (
    <div className="h-screen flex">
      <Sidebar menuItems={menuR} userOptions={userR} />
      <div className="flex-1 flex flex-col">
        <Header h_title={title} h_user="Guichetier" h_role="Guichet" />
        <main className="flex-1 overflow-auto p-6 bg-gray-100">
          {children}
        </main>
      </div>
    </div>
  )
}

/** Layout commun pour le Vendeur */
function VendeurLayout({ title, children }) {
  return (
    <div className="h-screen flex">
      <Sidebar menuItems={menuV} userOptions={userV} />
      <div className="flex-1 flex flex-col">
        <Header h_title={title} h_user="Vendeur" h_role="Vendeur" />
        <main className="flex-1 overflow-auto p-6 bg-gray-100">
          {children}
        </main>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Pages publiques */}
          <Route
            path="/login"
            element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicRoute>
                <RegisterPage />
              </PublicRoute>
            }
          />

          {/* Pages du Guichet */}
          <Route
            path="/"
            element={
              <PrivateRoute>
                <GuichetLayout title="Dashboard Guichet">
                  <DashboardGuichet />
                </GuichetLayout>
              </PrivateRoute>
            }
          />
          <Route
            path="/reservations"
            element={
              <PrivateRoute>
                <GuichetLayout title="Réservations">
                  <Reservation />
                </GuichetLayout>
              </PrivateRoute>
            }
          />
          <Route
            path="/etudiants"
            element={
              <PrivateRoute>
                <GuichetLayout title="Liste des étudiants">
                  <StudentList />
                </GuichetLayout>
              </PrivateRoute>
            }
          />
          <Route
            path="/profile_R"
            element={
              <PrivateRoute>
                <GuichetLayout title="Mon Profil">
                  <Profile_R />
                </GuichetLayout>
              </PrivateRoute>
            }
          />

          {/* Pages du Vendeur */}
          <Route
            path="/dashboardVendeur"
            element={
              <PrivateRoute>
                <VendeurLayout title="Dashboard Vendeur">
                  <DashboardVendeur />
                </VendeurLayout>
              </PrivateRoute>
            }
          />
          <Route
            path="/sell"
            element={
              <PrivateRoute>
                <VendeurLayout title="Vendre un ticket">
                  <SellTicket />
                </VendeurLayout>
              </PrivateRoute>
            }
          />
          <Route
            path="/history"
            element={
              <PrivateRoute>
                <VendeurLayout title="Historique des ventes">
                  <History />
                </VendeurLayout>
              </PrivateRoute>
            }
          />
          <Route
            path="/profile_V"
            element={
              <PrivateRoute>
                <VendeurLayout title="Mon Profil">
                  <Profile_V />
                </VendeurLayout>
              </PrivateRoute>
            }
          />

          {/* Redirection si route non trouvée */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
