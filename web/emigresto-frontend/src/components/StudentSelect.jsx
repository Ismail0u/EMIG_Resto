import { useQuery } from '@tanstack/react-query'
import { API } from '../services/apiService'
import Spinner from './Spinner'

/**
 * @param {string|number} value
 * @param {(newId:string) => void} onChange
 * @param {boolean} [disabled]
 */
export default function StudentSelect({ value, onChange, disabled }) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['students'],
    queryFn: () => API.etudiant.list({ page_size: 500 }),
    staleTime: 1000 * 60 * 5,
    keepPreviousData: true,
  })

  if (isLoading) return <Spinner />
  if (isError) return <p className="text-red-600 text-sm">Erreur de chargement des étudiants</p>

  return (
    <select
      value={value}
      disabled={disabled}
      onChange={e => onChange(e.target.value)}
      required
      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600 disabled:bg-gray-100"
    >
      <option value="" className="text-gray-400">— Sélectionner un étudiant —</option>
      {data?.results.map(s => (
        <option key={s.id} value={s.id}>
          {s.nom} {s.prenom} — {s.matricule}
        </option>
      ))}
    </select>
  )
}
