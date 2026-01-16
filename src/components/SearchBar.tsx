'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Search, X, AlertCircle } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { search } from '@/lib/api'
import { cn } from '@/lib/utils'
import type { SearchResultItem } from '@/types'

export function SearchBar() {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Debounced search
  const { data, isLoading } = useQuery({
    queryKey: ['search', query],
    queryFn: () => search.query(query, { limit: 8 }),
    enabled: query.length >= 2,
    staleTime: 30000,
  })

  const results = data?.data?.results || []

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + K to focus search
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        inputRef.current?.focus()
        setIsOpen(true)
      }
      // Escape to close
      if (e.key === 'Escape') {
        setIsOpen(false)
        inputRef.current?.blur()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.length >= 2) {
      router.push(`/dashboard/search?q=${encodeURIComponent(query)}`)
      setIsOpen(false)
    }
  }

  const handleResultClick = (result: SearchResultItem) => {
    router.push(`/dashboard/reports?id=${result.report_id}`)
    setIsOpen(false)
    setQuery('')
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <div className="relative w-full max-w-md">
      <form onSubmit={handleSearch}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setIsOpen(true)
            }}
            onFocus={() => setIsOpen(true)}
            placeholder="Search T5Ts..."
            className="w-full pl-10 pr-10 py-2 bg-gray-100 border border-transparent rounded-lg text-sm focus:outline-none focus:border-primary-300 focus:bg-white transition-colors"
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery('')
                setIsOpen(false)
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="absolute right-10 top-1/2 -translate-y-1/2 hidden sm:inline-flex items-center px-1.5 py-0.5 text-xs text-gray-400 bg-gray-200 rounded">
            ⌘K
          </kbd>
        </div>
      </form>

      {/* Dropdown results */}
      {isOpen && query.length >= 2 && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-2 bg-white rounded-lg shadow-lg border border-gray-200 max-h-96 overflow-y-auto"
        >
          {isLoading ? (
            <div className="p-4 text-center text-sm text-gray-500">
              Searching...
            </div>
          ) : results.length === 0 ? (
            <div className="p-4 text-center text-sm text-gray-500">
              No results found for "{query}"
            </div>
          ) : (
            <>
              <div className="p-2">
                {results.map((result) => (
                  <button
                    key={result.id}
                    onClick={() => handleResultClick(result)}
                    className="w-full p-3 text-left hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      {result.is_blocker && (
                        <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900 line-clamp-2">
                          {result.content}
                        </p>
                        <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                          <span>{result.worker_name}</span>
                          {result.team_name && (
                            <>
                              <span>·</span>
                              <span>{result.team_name}</span>
                            </>
                          )}
                          <span>·</span>
                          <span>{formatDate(result.week_of)}</span>
                        </div>
                        {result.themes.length > 0 && (
                          <div className="flex gap-1 mt-1.5">
                            {result.themes.slice(0, 3).map((theme) => (
                              <span
                                key={theme}
                                className="px-1.5 py-0.5 text-xs bg-gray-100 text-gray-600 rounded"
                              >
                                {theme}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
              <div className="p-2 border-t bg-gray-50">
                <button
                  onClick={handleSearch}
                  className="w-full p-2 text-sm text-primary-600 hover:text-primary-700 font-medium text-center"
                >
                  View all results for "{query}"
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
