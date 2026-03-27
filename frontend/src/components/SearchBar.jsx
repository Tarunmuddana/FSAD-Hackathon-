import { Search } from 'lucide-react';

export default function SearchBar({ value, onChange, placeholder = "Search by skills..." }) {
  return (
    <div className="search-container">
      <Search className="search-icon" size={20} />
      <input
        type="text"
        className="search-input"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
