// src/components/ReservationGrid.jsx
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { API } from '../services/apiServices'
import Spinner from './Spinner'
import { useState } from 'react'

export default function ReservationGrid() {
  const qc = useQueryClient()
  const [selectedWeek, setSelectedWeek] = useState(() => {
    const today = new Date()
    const day = today.getDay()
    const diff = today.getDate() - day + (day === 0 ? -6 : 1) // Lundi de la semaine en cours
    return new Date(today.setDate(diff))
  })

  // Calcul des dates pour chaque jour de la semaine
  const getWeekDates = () => {
    const weekDates = {}
    const startDate = new Date(selectedWeek)
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate)
      date.setDate(startDate.getDate() + i)
      weekDates[i + 1] = date.toISOString().split('T')[0] // Jour ID -> Date (YYYY-MM-DD)
    }
    
    return weekDates
  }

  const weekDates = getWeekDates()

  // 1) Chargement des ressources
  const { data: studentsData, isLoading: stLoad, isError: stErr } = useQuery({
    queryKey: ['students'],
    queryFn: () => API.etudiant.list({ page_size: 500 }),
    keepPreviousData: true,
  })
  
  const { data: joursData, isLoading: jLoad, isError: jErr } = useQuery({
    queryKey: ['jours'],
    queryFn: () => API.jour.list({ page_size: 7 }),
  })
  
  const { data: periodesData, isLoading: pLoad, isError: pErr } = useQuery({
    queryKey: ['periodes'],
    queryFn: () => API.periode.list(),
  })
  
  const { data: reservData, isLoading: rLoad, isError: rErr } = useQuery({
    queryKey: ['reservations', selectedWeek.toISOString()],
    queryFn: () => {
      const startDate = weekDates[1] // Date du lundi
      const endDate = new Date(startDate)
      endDate.setDate(endDate.getDate() + 6)
      
      return API.reservation.list({ 
        date_after: startDate,
        date_before: endDate.toISOString().split('T')[0],
        page_size: 1000 
      })
    },
    keepPreviousData: true,
  })

  // 2) Mutation upsert
  const upsertMut = useMutation({
    mutationFn: async ({ etudiant, jour, periode, resId }) => {
      if (resId) {
        return API.reservation.delete(resId)
      } else {
        const date = weekDates[jour]
        return API.reservation.create({ 
          etudiant, 
          jour, 
          periode, 
          date,
          heure: "12:00:00"
        })
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['reservations'] }),
    onError: (error) => {
      console.error('Erreur de réservation:', error)
    }
  })

  // 3) Loader / erreur
  if (stLoad || jLoad || pLoad || rLoad) return <Spinner />
  if (stErr || jErr || pErr || rErr) {
    return <div className="p-4 text-red-600">Erreur de chargement des données…</div>
  }

  // 4) Lookup des réservations existantes
  const lookup = {}
  reservData?.results?.forEach(r => {
    lookup[`${r.etudiant}-${r.jour}-${r.periode}`] = r.id
  })

  // 5) Colonnes dynamiques
  const headers = joursData?.results?.flatMap(j =>
    periodesData?.results?.map(p => ({ j, p }))
  )

  // 6) Rendu
  return (
    <div className="overflow-x-auto p-4">
      <div className="mb-4 flex items-center">
        <label className="mr-2 font-medium">Semaine du:</label>
        <input
          type="date"
          value={selectedWeek.toISOString().split('T')[0]}
          onChange={e => setSelectedWeek(new Date(e.target.value))}
          className="border px-3 py-1 rounded"
        />
      </div>

      <table className="min-w-full bg-white rounded shadow">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-4 py-2">ID</th>
            <th className="px-4 py-2">Nom</th>
            <th className="px-4 py-2">Prénom</th>
            {headers?.map(({ j, p }) => (
              <th
                key={`${j.id}-${p.id}`}
                className="px-2 py-1 text-center text-xs font-semibold"
              >
                <div>{j.nomJour}</div>
                <div className="text-xxs">{p.nomPeriode}</div>
                <div className="text-xxs text-gray-500">
                  {weekDates[j.id]?.split('-')?.reverse()?.join('/')}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {studentsData?.results?.map(u => (
            <tr key={u.id} className="even:bg-gray-50">
              <td className="px-4 py-2">{u.id}</td>
              <td className="px-4 py-2">{u.nom}</td>
              <td className="px-4 py-2">{u.prenom}</td>
              {headers?.map(({ j, p }) => {
                const key = `${u.id}-${j.id}-${p.id}`
                const resId = lookup[key]
                return (
                  <td key={key} className="px-2 py-1 text-center">
                    <input
                      type="checkbox"
                      checked={Boolean(resId)}
                      onChange={() =>
                        upsertMut.mutate({ 
                          etudiant: u.id, 
                          jour: j.id, 
                          periode: p.id, 
                          resId 
                        })
                      }
                      className="h-4 w-4 cursor-pointer"
                      disabled={upsertMut.isLoading}
                    />
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
      
      {upsertMut.isError && (
        <div className="mt-4 p-3 bg-red-100 text-red-700 rounded">
          Erreur: {upsertMut.error.detail || "Échec de l'opération"}
        </div>
      )}
    </div>
  )
}