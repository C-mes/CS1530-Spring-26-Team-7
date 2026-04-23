// AddItem.js - form component for adding a new item to the fridge inventory.
// Sends a POST request to the Flask backend at /items.

import { useState } from 'react';
import './AddItem.css';

// `onAdded` is an optional callback the parent passes in so it can refresh
// its item list after a successful add.
export default function AddItem({ onAdded }) {
  // Form state: one object holding all three input field values.
  const [form, setForm] = useState({ name: '', desc: '', exp: '' });
  // Feedback message shown below the form (success or error).
  const [status, setStatus] = useState(null);
  // Disables the submit button while a request is in flight.
  const [submitting, setSubmitting] = useState(false);

  // Returns a change handler bound to a specific field key.
  // Using one factory avoids writing three near-identical handlers.
  const update = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  // Handles form submission: POSTs the form data as JSON, then updates UI.
  const submit = async (e) => {
    e.preventDefault(); // prevent browser's default full-page reload on submit

    //validate the is today or later before submitting
    const today = new Date().toISOString().split('T')[0]; 
    if (form.exp && form.exp < today) {
      setStatus({ type: 'err', msg: 'Expiration date cannot be in the past' });
      return; 
    }

    setSubmitting(true);
    setStatus(null);
    try {
      const res = await fetch('http://localhost:5000/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        // Backend returns the created item (with its new id) on 201.
        const item = await res.json();
        setForm({ name: '', desc: '', exp: '' }); // clear inputs
        setStatus({ type: 'ok', msg: `Added "${item.name}" (expires ${item.exp})` });
        onAdded?.(item); // tell parent so it can reload the list
      } else {
        // Backend sent an error response (e.g., 400 missing data).
        const err = await res.json().catch(() => ({}));
        setStatus({ type: 'err', msg: err.error || `Error ${res.status}` });
      }
    } catch (err) {
      // Network failure - server down, CORS blocked, etc.
      setStatus({ type: 'err', msg: 'Could not reach server' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    // Controlled form: each input's value comes from state, updated on change.
    <form className="add-item" onSubmit={submit}>
      <h2>Add Item</h2>

      <label>
        Name
        <input
          type="text"
          value={form.name}
          onChange={update('name')}
          required
        />
      </label>

      <label>
        Description
        <input
          type="text"
          value={form.desc}
          onChange={update('desc')}
          required
        />
      </label>

      <label>
        Expiration (optional — defaults to +7 days)
        {/* Not marked required: backend fills in a default date when empty. */}
        <input type="date" value={form.exp} onChange={update('exp')} />
      </label>

      <button type="submit" disabled={submitting}>
        {submitting ? 'Adding…' : 'Add Item'}
      </button>

      {/* Conditionally render the status message with color based on type. */}
      {status && (
        <p className={status.type === 'ok' ? 'status-ok' : 'status-err'}>
          {status.msg}
        </p>
      )}
    </form>
  );
}
