import { ChevronLeft, ChevronRight } from 'lucide-react'
import React from 'react'

const Pagination = ({ currentPage, totalPages, setCurrentPage }) => {
  // Génère un tableau de pages à afficher, avec ellipses si besoin
  const getPageNumbers = () => {
    const delta = 2 // nombre de pages avant/après la page courante
    const range = []
    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 || 
        i === totalPages || 
        (i >= currentPage - delta && i <= currentPage + delta)
      ) {
        range.push(i)
      } else if (
        i === currentPage - delta - 1 ||
        i === currentPage + delta + 1
      ) {
        range.push('...')
      }
    }
    return [...new Set(range)] // unique
  }

  const pages = getPageNumbers()

  return (
    <nav
      className="flex justify-between items-center mt-4 border-t pt-2"
      aria-label="Pagination Navigation"
    >
      <span className="text-sm text-gray-700">
        Page <span className="font-semibold">{currentPage}</span> /{' '}
        <span className="font-semibold">{totalPages}</span>
      </span>

      <div className="flex gap-1">
        <button
          onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
          disabled={currentPage === 1}
          aria-label="Page précédente"
          className={`p-2 rounded ${
            currentPage === 1
              ? 'bg-gray-300 cursor-not-allowed opacity-50'
              : 'bg-gray-200 hover:bg-gray-300'
          }`}
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {pages.map((page, idx) =>
          page === '...' ? (
            <span key={idx} className="px-2 py-1 select-none">
              …
            </span>
          ) : (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              aria-current={page === currentPage ? 'page' : undefined}
              className={`px-3 py-1 rounded ${
                page === currentPage
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 hover:bg-gray-300'
              }`}
            >
              {page}
            </button>
          )
        )}

        <button
          onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
          disabled={currentPage === totalPages}
          aria-label="Page suivante"
          className={`p-2 rounded ${
            currentPage === totalPages
              ? 'bg-gray-300 cursor-not-allowed opacity-50'
              : 'bg-gray-200 hover:bg-gray-300'
          }`}
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </nav>
  )
}

export default Pagination
