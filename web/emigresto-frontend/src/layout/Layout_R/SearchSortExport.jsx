import { ChevronDown, ChevronUp } from 'lucide-react'
import React, { useState, useEffect, useRef } from 'react'

const columns = [
  { key: 'idEtudiant', label: 'ID' },
  { key: 'nomEtudiant', label: 'Nom' },
  { key: 'prenomEtudiant', label: 'Prénom' },
]

const SearchSortExport = ({ searchTerm, setSearchTerm, sortBy, setSortBy, exportToPDF }) => {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  // Fermer le menu si clic hors du composant
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="flex justify-between items-center mb-4">
      <input
        type="text"
        placeholder="Rechercher…"
        className="p-2 border rounded w-1/3 focus:outline-blue-500"
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value.toLowerCase())} // casse insensible
        aria-label="Recherche"
      />

      <div className="flex gap-2" ref={ref}>
        <button
          className="flex items-center gap-1 px-4 py-2 bg-gray-200 rounded focus:outline-blue-500"
          onClick={() => setOpen(o => !o)}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-label="Menu de tri"
        >
          Trier par
          {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {open && (
          <ul
            className="absolute right-0 mt-1 bg-white border rounded shadow-sm z-10 w-40"
            role="listbox"
            tabIndex={-1}
          >
            {columns.map(({ key, label }) => (
              <li
                key={key}
                className={`px-4 py-2 hover:bg-gray-100 cursor-pointer flex justify-between items-center ${
                  sortBy === key ? 'bg-blue-100 font-semibold' : ''
                }`}
                role="option"
                aria-selected={sortBy === key}
                tabIndex={0}
                onClick={() => { setSortBy(key); setOpen(false) }}
                onKeyDown={e => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    setSortBy(key)
                    setOpen(false)
                  }
                }}
              >
                {label}
                {sortBy === key && <span>✓</span>}
              </li>
            ))}
          </ul>
        )}

        <button
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-blue-500"
          onClick={exportToPDF}
          aria-label="Exporter en PDF"
        >
          Exporter PDF
        </button>
      </div>
    </div>
  )
}

export default SearchSortExport
