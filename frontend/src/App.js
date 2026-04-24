// App.js - root component. Renders the Add Item form and a live list of
// items fetched from the Flask backend.

import { useEffect, useState } from 'react';
import AddItem from './AddItem';
import './App.css';

// Number of days out at which an item starts showing a "warning" color.
// Anything at or past its expiration date gets the stronger "alert" color.
const WARNING_DAYS = 3;
const MS_PER_DAY = 1000 * 60 * 60 * 24;

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

// Parse a YYYY-MM-DD string as local midnight. A bare date string would parse
// as UTC and shift by a day for users west of UTC, so we append the time.
function parseLocalDate(yyyyMmDd) {
  const d = new Date(`${yyyyMmDd}T00:00:00`);
  return Number.isNaN(d.getTime()) ? null : d;
}

// Classify an item's expiration date (YYYY-MM-DD) as 'alert', 'warning', or 'ok'.
// Returns '' when exp is missing or unparseable so no class is applied.
function expirationStatus(exp) {
  const expDate = exp ? parseLocalDate(exp) : null;
  if (!expDate) return '';

  // Math.round (not floor) keeps the count accurate across DST transitions,
  // where two local midnights can differ by 23 or 25 hours.
  const daysUntilExpiration = Math.round((expDate - startOfToday()) / MS_PER_DAY);

  if (daysUntilExpiration <= 0) return 'alert';
  if (daysUntilExpiration <= WARNING_DAYS) return 'warning';
  return 'ok';
}

function App() {
  // Items currently in the fridge inventory (loaded from GET /items).
  const [items, setItems] = useState([]);
  // Error message if the fetch fails (server down, network issue, etc.).
  const [error, setError] = useState(null);
  // Text entered in the search bar to filter visible items.
  const [searchQuery, setSearchQuery] = useState('');
  // Controls sorting by expiration date.
  const [sortOrder, setSortOrder] = useState('earliest');
  // Fetches the current item list from the backend and stores it in state.
  // Also passed to AddItem as a callback so the list refreshes after a POST.
  const loadItems = async () => {
    try {
      const res = await fetch('http://localhost:5000/items');
      if (!res.ok) throw new Error(`Error ${res.status}`);
      setItems(await res.json());
    } catch (err) {
      setError('Could not load items');
    }
  };

  // Run loadItems once when the component first mounts.
  // Empty dependency array = "only on mount", not on every re-render.
  useEffect(() => {
    loadItems();
  }, []);

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filteredItems = items.filter((item) => {
    if (!normalizedQuery) return true;
    return [item.name, item.desc, item.exp]
      .filter(Boolean)
      .some((value) => value.toLowerCase().includes(normalizedQuery));
  });
  const sortedItems = [...filteredItems].sort((a, b) => {
    const aDate = a.exp ? parseLocalDate(a.exp) : null;
    const bDate = b.exp ? parseLocalDate(b.exp) : null;
    const aTime = aDate ? aDate.getTime() : Number.POSITIVE_INFINITY;
    const bTime = bDate ? bDate.getTime() : Number.POSITIVE_INFINITY;

    if (sortOrder === 'latest') return bTime - aTime;
    return aTime - bTime;
  });

  return (
    <div className="App">
      <header className="App-header">
        <div className="header-content">
          <h1>Fridge App</h1>
          <p>Track inventory, search quickly, and spot expiring items on any screen size.</p>
        </div>
      </header>

      <main className="app-main">
        {/* Pass loadItems down so AddItem can trigger a refresh after adding. */}
        <AddItem onAdded={loadItems} />

        <section className="item-list">
          <h2>Items</h2>
          <div className="item-controls">
            <div className="control-group">
              <label className="search-label" htmlFor="item-search">
                Search items
              </label>
              <input
                id="item-search"
                className="item-search"
                type="search"
                placeholder="Search by name, description, or date"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="control-group">
              <label className="sort-label" htmlFor="item-sort">
                Sort by expiration date
              </label>
              <select
                id="item-sort"
                className="item-sort"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
              >
                <option value="earliest">Earliest date first</option>
                <option value="latest">Latest date first</option>
              </select>
            </div>
          </div>
          {error && <p className="status-err">{error}</p>}
          {items.length === 0 ? (
            <p>No items yet.</p>
          ) : filteredItems.length === 0 ? (
            <p>No matching items.</p>
          ) : (
            <ul>
              {/* key={item.id} lets React efficiently update the list. */}
              {sortedItems.map((item) => {
                const status = expirationStatus(item.exp);
                return (
                  <li key={item.id} className={`item-${status}`}>
                    <div className="item-row">
                      <div className="item-copy">
                        <strong>{item.name}</strong>
                        <span>{item.desc}</span>
                      </div>
                      <div className="item-meta">
                        <span className="item-date">exp: {item.exp}</span>
                        {status === 'alert' && <span className="exp-badge">expired</span>}
                        {status === 'warning' && <span className="exp-badge">expiring soon</span>}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;
