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
  const lower = city.toLowerCase().trim();
  return cityMap[lower] || lower;
}

function App() {
  const [query, setQuery] = useState('');

  const normalizedQuery = useMemo(() => normalizeCity(query), [query]);

  const results = useMemo(() => {
    if (!normalizedQuery || normalizedQuery.length < 2) return { born: [], affiliated: [], total: 0 };

    const born = laureates.filter(l => l.birthCity && normalizeCity(l.birthCity) === normalizedQuery);
    const affiliated = laureates.filter(l => 
      l.affiliationCities.some(city => normalizeCity(city) === normalizedQuery)
    );

    // Combine and unique by ID
    const allUniqueIds = new Set([...born.map(l => l.id), ...affiliated.map(l => l.id)]);
    
    return {
      born,
      affiliated,
      totalCount: allUniqueIds.size,
      displayCity: query // Keep original casing for display
    };
  }, [normalizedQuery, query]);

  return (
    <div className="container">
      <header>
        <h1>Find your Nobel Laureate</h1>
        <p>Discover science laureates born in or affiliated with your city.</p>
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
              <strong>{results.totalCount}</strong> {results.totalCount === 1 ? 'person has' : 'people have'} won a science Nobel.{' '}
              <strong>{results.born.length}</strong> {results.born.length === 1 ? 'was' : 'were'} born in {results.displayCity}, and{' '}
              <strong>{results.affiliated.length}</strong> {results.affiliated.length === 1 ? 'was' : 'were'} affiliated with an institution in {results.displayCity} at the time of their award.
            </p>
          </div>
        )}

        <div className="laureate-list">
          {/* We show the union of both lists */}
          {Array.from(new Set([...results.born, ...results.affiliated])).map((l) => (
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
