import { useState, useMemo } from 'react';
import laureatesData from './data/laureates.json';
import './App.css';

interface Laureate {
  id: string;
  fullName: string;
  category: string;
  year: string | number;
  birthCity: string | null;
  affiliationCities: string[];
  motivation: string;
}

const laureates = laureatesData as Laureate[];

// Normalization mapping to match the fetcher
const cityMap: { [key: string]: string } = {
  'new york city': 'new york',
  'nyc': 'new york',
  'st. louis': 'saint louis',
};

function normalizeCity(city: string): string {
  // Lowercase, trim, and take only the part before the first comma
  let normalized = city.toLowerCase().trim().split(',')[0].trim();
  
  // Manual mapping for common aliases
  if (cityMap[normalized]) {
    normalized = cityMap[normalized];
  }
  
  // Remove diacritics
  normalized = normalized.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  
  return normalized;
}

function App() {
  const [query, setQuery] = useState('');

  const normalizedQuery = useMemo(() => normalizeCity(query), [query]);

  const results = useMemo(() => {
    if (!normalizedQuery || normalizedQuery.length < 2) return { born: [], affiliated: [], totalCount: 0, displayCity: query };

    // Use includes() for a more flexible search
    const born = laureates.filter(l => 
      l.birthCity && normalizeCity(l.birthCity).includes(normalizedQuery)
    );
    const affiliated = laureates.filter(l => 
      l.affiliationCities.some(city => normalizeCity(city).includes(normalizedQuery))
    );

    // Combine and unique by ID
    const allUniqueIds = new Set([...born.map(l => l.id), ...affiliated.map(l => l.id)]);
    const uniqueResults = Array.from(allUniqueIds).map(id => laureates.find(l => l.id === id)!);
    
    return {
      born,
      affiliated,
      uniqueResults,
      totalCount: allUniqueIds.size,
      displayCity: query
    };
  }, [normalizedQuery, query]);

  return (
    <div className="container">
      <header>
        <h1>Find your Nobel Laureate</h1>
        <p>Discover science laureates born in or affiliated with your city.</p>
        <p style={{ fontSize: '0.8rem', color: '#666' }}>
          Searching across {laureates.length} science laureates.
        </p>
        <div className="search-box">
          <input
            type="text"
            placeholder="Enter a city (e.g. New York, Ulm, Paris)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
        </div>
      </header>

      <main>
        {normalizedQuery.length >= 2 && (
          <div className="results-summary">
            <p>
              <strong>{results.totalCount}</strong> {results.totalCount === 1 ? 'person associated' : 'people associated'} with <strong>{results.displayCity}</strong> {results.totalCount === 1 ? 'has' : 'have'} won a Nobel prize in science.
            </p>
            <p style={{ fontSize: '0.9rem', marginTop: '0.5rem', opacity: 0.8 }}>
              {results.born.length} were born there, and {results.affiliated.length} were affiliated with an institution there at the time of their award.
            </p>
          </div>
        )}

        <div className="laureate-list">
          {results.uniqueResults?.map((l) => (
            <div key={`${l.id}-${l.category}`} className="laureate-card">
              <h3>{l.fullName}</h3>
              <div className="meta">
                <span className="category">{l.category}</span>
                <span className="year">{l.year}</span>
              </div>
              <p className="motivation">"{l.motivation}"</p>
              <div className="connection">
                {results.born.some(b => b.id === l.id) && <span className="tag birth">Born here</span>}
                {results.affiliated.some(a => a.id === l.id) && <span className="tag affiliation">Affiliated here</span>}
              </div>
            </div>
          ))}
        </div>

        {query.length >= 2 && results.totalCount === 0 && (
          <p className="no-results">No science laureates found for "{query}".</p>
        )}
      </main>

      <footer>
        <p>Data provided by the <a href="https://www.nobelprize.org/about/developer-zone-2/" target="_blank" rel="noreferrer">Nobel Prize API</a>. Science categories include Physics, Chemistry, and Medicine.</p>
      </footer>
    </div>
  );
}

export default App;
