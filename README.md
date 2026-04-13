# Fridge App (Name TBD)
## CS 1530 - Spring 2026

### Team 7:
- YanJia Chen
- Nick Hoffman
- Juniper Ferlan
- Chung Yan Chan
- Justin Atkins
- Christian Messam
- Holden Gent

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
    - `pip3 install flask`
5. ** IF inventory.db IS MISSING ** Initialize database
    - `python3 backend/createdb.py`
5. Run
    - `python3 backend/app.py`

### Frontend (React):
1. IN NEW TERMINAL - from root: `cd frontend`
2. **FIRST TIME ONLY:** Install dependencies
    - `npm install`
3. Run
    - `npm start`
