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
const getWeek = () => {
  const today = new Date()
  const monday = new Date(today)
  monday.setDate(today.getDate() - ((today.getDay() + 6) % 7))
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    return d.toISOString().split('T')[0]
  })
}

const days = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']

export default function GraphComponent() {
  const [dataSet, setDataSet] = useState([])
  const weekDates = getWeek()

  useEffect(() => {
    API.reservation.list()
      .then(res => setDataSet(res.results))
      .catch(() => {
        // Gérer l'erreur si nécessaire, par exemple avec un état d'erreur
      })
  }, [])

  const counts = weekDates.map(date =>
    dataSet.filter(r => r.date === date).length
  )

  const data = {
    labels: days,
    datasets: [{
      label: 'Réservations',
      data: counts,
      borderColor: '#3b82f6',
      backgroundColor: 'rgba(59,130,246,0.3)',
      tension: 0.3,
    }]
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false, // TRÈS IMPORTANT pour permettre au graphique de se redimensionner librement dans son conteneur
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
          precision: 0
        },
        // Assurer que la hauteur de l'axe y est contrainte par le parent
        grid: {
            drawBorder: false,
        }
      },
      x: {
        title: { display: false },
        grid: {
            display: false // Cache les lignes de grille verticales
        }
      }
    },
    plugins: {
      legend: { position: 'top' },
      title: {
        display: false,
        text: 'Nombre de réservations par jour'
      }
    },
  }

  // Le conteneur parent doit être flex et le div du graphique doit avoir flex-1 et relative
  return (
    <div className="flex flex-col h-full"> {/* Ajout de flex-col et h-full */}
      {/* Ce div contient le graphique et utilise flex-1 pour prendre l'espace disponible */}
      {/* et relative pour que le graphique puisse se positionner si besoin */}
      <div className="flex-1 relative">
        <Line data={data} options={options} />
      </div>
    </div>
  )
}