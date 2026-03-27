import { useState } from 'react'
import './SearchBar.css'

export default function SearchBar({ onSearch }) {
  const [query, setQuery] = useState('')

  const handleChange = (e) => {
    setQuery(e.target.value)
    onSearch(e.target.value)
  }

  return (
    <div className="search-bar">
      <span className="search-icon">⌕</span>
      <input
        type="text"
        placeholder="Filter by skill…"
        value={query}
        onChange={handleChange}
        className="search-input"
      />
      {query && (
        <button className="search-clear" onClick={() => { setQuery(''); onSearch('') }}>✕</button>
      )}
    </div>
  )
}
