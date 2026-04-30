# Fridge App (Name TBD)
## CS 1530 - Spring 2026

## Team 7 - Members And Contributions
- YanJia Chen: database setup & functionality, backend input validation
- Nick Hoffman: frontend UI/UX, input validation
- Juniper Ferlan: initial React app setup and frontend project scaffolding, README updates
- Chung Yan Chan: frontend search & sort functionality
- Justin Atkins: backend tests, frontend item display behavior
- Christian Messam: API input validation additions
- Holden Gent: responsive/mobile layout improvements
- Team-wide: feature planning, integration, debugging, documentation, and sprint deliverables

## Project Overview And Purpose
Fridge App is a full-stack inventory tracker web app for household food management. The app helps users keep record their fridge items, view what is currently stored, and identify food that is expired or close to expiring.

The purpose of the project is to give users a simple way to manage perishable food items while also giving the team experience building and testing a small web application with a React frontend, a Flask backend, and a SQLite database.

## Setup/Running
### Prerequisites:
- Python 3
- Node.js

### Backend (Flask):
1. From root: `cd backend`
2. **FIRST TIME ONLY:** Create virtual environment
    - Windows: `python -m venv venv`
    - Mac/Linux: `python3 -m venv venv`
3. Activate virtual environment
    - Windows: `.\venv\Scripts\activate`
    - Mac/Linux: `source venv/bin/activate`
4. Install dependencies
    - `pip3 install flask flask-cors`
5. **IF inventory.db IS MISSING** Initialize database
    - `python3 createdb.py`
6. Run
    - `python3 app.py`

### Frontend (React):
1. IN NEW TERMINAL - from root: `cd frontend`
2. **FIRST TIME ONLY:** Install dependencies
    - `npm install`
3. Run
    - `npm start`

### Running tests
- Backend tests: from `backend`, run `python3 -m pytest test_app.py`
- Frontend tests: from `frontend`, run `npm test -- --watchAll=false`

## Tech Stack Summary
- Frontend: React, JavaScript, CSS
- Backend: Python, Flask, Flask-CORS
- Database: SQLite
- Testing: Pytest, React Testing Library, Jest
- Other: npm, Node.js, venv

## Implemented Features
### Add item
What it does:
- Lets the user create a new inventory entry with a name, description, and optional expiration date.

How to use it:
- Fill in the Name and Description fields.
- Optionally choose an expiration date.
- Click `Add Item`.
- If no expiration date is entered, the backend defaults it to 7 days from the current date.

### View inventory list
What it does:
- Displays all stored fridge items returned by the backend/database.

How to use it:
- Open the main page and scroll to the `Items` section.
- Each saved entry appears with its name, description, and expiration date.
  
### Delete item
What it does:
- Lets the user remove an existing inventory entry.

How to use it:
- Click the delete button next to an item in the inventory list.
  
### Search items
What it does:
- Filters the visible inventory list by matching the search text against item names and/or descriptions.

How to use it:
- Type into the `Search items` field.
- The list updates automatically as you type.

### Sort by expiration date
What it does:
- Reorders the inventory list so users can review the earliest or latest expiration dates first.

How to use it:
- Use the `Sort by expiration date` dropdown.
- Choose `Earliest date first` or `Latest date first`.

### Expiration status highlighting
What it does:
- Highlights list items that are expired or expiring soon to help users spot urgent items quickly.

How to use it:
- View the item list after items are loaded.
- Items at or past expiration show an `expired` badge and are highlighted red.
- Items within the warning window (three days) show an `expiring soon` badge and are highlighted yellow.

### Client-side expiration date restriction
What it does:
- Prevents users from submitting a past expiration date from the add-item form.

How to use it:
- Try entering a date earlier than today in the form.
- The form will show an error instead of submitting the item.

### Backend API
What it does:
- Exposes endpoints for creating, reading, updating, and deleting inventory items in the SQLite database.

How to use it:
- `GET /items` returns all items
- `POST /items` creates a new item
- `PUT /items/<id>` updates an existing item
- `DELETE /items/<id>` removes an item

### Backend input validation
What it does:
- Rejects malformed or unsafe data inputs such as blank names, blank descriptions, invalid ISO dates, and invalid number values.

How to use it:
- Send invalid JSON data to the backend API and the server will respond with a `400` error and an error message.
