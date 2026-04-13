import { render, screen, waitFor } from '@testing-library/react';
import App from './App';

// App fetches /items on mount, so stub fetch to avoid network calls in tests.
beforeEach(() => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve([]),
    })
  );
});

afterEach(() => {
  jest.restoreAllMocks();
});

test('renders Fridge App heading', async () => {
  render(<App />);
  expect(screen.getByRole('heading', { name: /fridge app/i })).toBeInTheDocument();
  // Wait for the mocked fetch to resolve so React state updates flush before teardown.
  await waitFor(() => expect(global.fetch).toHaveBeenCalledWith('http://localhost:5000/items'));
});

test('renders Add Item form', async () => {
  render(<App />);
  expect(screen.getByRole('heading', { name: /add item/i })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /add item/i })).toBeInTheDocument();
  // Let the mounted fetch resolve so the act() warning doesn't fire.
  await waitFor(() => expect(global.fetch).toHaveBeenCalled());
});
