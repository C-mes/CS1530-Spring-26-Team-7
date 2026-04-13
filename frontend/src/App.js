// App.js - root component. Renders the Add Item form and a live list of
// items fetched from the Flask backend.

import { useEffect, useState } from 'react';
import AddItem from './AddItem';
import './App.css';

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
              {items.map((item) => (
                <li key={item.id}>
                  <strong>{item.name}</strong> — {item.desc} (exp: {item.exp})
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;
