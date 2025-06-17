import {
  CategoryScale, Chart as ChartJS, Legend, LinearScale,
  LineElement, PointElement, Title, Tooltip
} from 'chart.js'
import React, { useEffect, useState } from 'react'
import { Line } from 'react-chartjs-2'
import { API } from '../../services/apiService'

// Enregistrement des composants nécessaires pour ChartJS
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

// Fonction utilitaire : calcul des dates de la semaine (du lundi au dimanche)
// Renvoie un tableau de dates au format 'YYYY-MM-DD'
const getWeek = () => {
  const today = new Date()
  const monday = new Date(today)
  // Calcul du lundi de la semaine courante
  monday.setDate(today.getDate() - ((today.getDay() + 6) % 7))
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    return d.toISOString().split('T')[0]
  })
}

// Labels jours en français, ordre Lundi-Dimanche
const days = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']

export default function GraphComponent() {
  const [dataSet, setDataSet] = useState([])  // données de réservation brutes
  const weekDates = getWeek()                 // dates de la semaine affichée

  useEffect(() => {
    // Chargement des réservations via API à la première montée du composant
    API.reservation.list()
      .then(res => setDataSet(res.results))
      .catch(() => {
        // Gestion silencieuse des erreurs, tu peux aussi afficher une erreur si besoin
      })
  }, [])

  // Compte des réservations par jour selon weekDates
  const counts = weekDates.map(date =>
    dataSet.filter(r => r.date === date).length
  )

  // Configuration des données pour ChartJS
  const data = {
    labels: days,
    datasets: [{
      label: 'Réservations',
      data: counts,
      borderColor: '#3b82f6',
      backgroundColor: 'rgba(59,130,246,0.3)',
      tension: 0.3,  // courbure de la ligne
    }]
  }

  // Options pour personnaliser l'affichage du graphique
  const options = {
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1, // pas d'incrémentation à 1
          precision: 0
        }
      },
      x: {
        title: { display: false }
      }
    },
    plugins: {
      legend: { position: 'top' },
      title: {
        display: false,
        text: 'Nombre de réservations par jour'
      }
    },
    responsive: true,
    maintainAspectRatio: false,
  }

  return (
    <div className="p-4 bg-white rounded-md shadow-sm">
      <h2 className="text-lg font-semibold mb-2 text-center">Réservations de la semaine</h2>
      {/* Hauteur fixée pour que le graphique s'affiche correctement */}
      <div className="h-48">
        <Line data={data} options={options} />
      </div>
    </div>
  )
}
