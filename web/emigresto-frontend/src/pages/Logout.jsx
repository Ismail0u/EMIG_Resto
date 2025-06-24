// src/pages/Logout.jsx
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Logout() {
  const { logout } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    async function doLogout() {
      await logout()
      navigate('/login', { replace: true })
    }
    doLogout()
  }, [logout, navigate])

  return null  // ou un petit spinner si tu veux
}
