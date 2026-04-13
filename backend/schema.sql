DROP TABLE IF EXISTS inventory;

CREATE TABLE IF NOT EXISTS inventory (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    desc TEXT NOT NULL,
    exp TEXT NOT NULL  -- store ISO date string
);
