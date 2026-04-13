import sqlite3

conn = sqlite3.connect('inventory.db')
with open('schema.sql') as f:
    conn.executescript(f.read())

cursor = conn.cursor()

cursor.execute("INSERT INTO inventory (name, desc, exp) VALUES (?, ?, ?)", ("Apple", "An apple", "2000-01-01"))
cursor.execute("INSERT INTO inventory (name, desc, exp) VALUES (?, ?, ?)", ("Banana", "A banana", "2009-09-09"))

conn.commit()
conn.close()
