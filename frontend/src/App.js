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

  return (
    <div className="App">
      <header className="App-header">
        <h1>Fridge App</h1>
      </header>

      <main>
        {/* Pass loadItems down so AddItem can trigger a refresh after adding. */}
        <AddItem onAdded={loadItems} />

        <section className="item-list">
          <h2>Items</h2>
          {error && <p className="status-err">{error}</p>}
          {items.length === 0 ? (
            <p>No items yet.</p>
          ) : (
            <ul>
              {/* key={item.id} lets React efficiently update the list. */}
              {items.map((item) => {
                const status = expirationStatus(item.exp);
                return (
                  <li key={item.id} className={`item-${status}`}>
                    <strong>{item.name}</strong> — {item.desc} (exp: {item.exp})
                    {status === 'alert' && <span className="exp-badge"> expired</span>}
                    {status === 'warning' && <span className="exp-badge"> expiring soon</span>}
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
