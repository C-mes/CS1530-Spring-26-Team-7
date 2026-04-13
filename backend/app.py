# Rudimentary skeleton code for the database
# Outputs as raw JSON

import sqlite3
from flask import Flask, jsonify, request
from datetime import date

app = Flask(__name__)

DB = 'inventory.db'

def db_conn():
    conn = sqlite3.connect(DB)
    conn.row_factory = sqlite3.Row #rows like dictionaries
    return conn

@app.route('/')
def index():
    return "Under construction. See /items for in-browser view and testing"

@app.route('/items', methods=['GET'])
def get_items():
    conn = db_conn()
    items = conn.execute('SELECT * FROM inventory').fetchall()
    conn.close
    return jsonify([dict(item) for item in items])
    
@app.route('/items', methods=['POST'])
def create_item():
    data = request.get_json()

    name = data.get('name')
    desc = data.get('desc')
    exp  = data.get('exp') or (date.today() + timedelta(days=7)).isoformat()
    
    if not name or not desc or not exp:
        return jsonify({'error': 'Missing data'}), 400

    conn = db_conn()
    cursor = conn.cursor()

    cursor.execute(
        'INSERT INTO inventory (name, desc, exp) VALUES (?, ?, ?)',
        (name, desc, exp)
    )

    conn.commit()
    new_id = cursor.lastrowid
    conn.close()

    return jsonify({'id': new_id, 'name': name, 'desc': desc, 'exp': exp}), 201


@app.route('/items/<int:id>', methods=['PUT'])
def update_user(id):
    data = request.get_json()

    name = data.get('name')
    desc = data.get('desc')
    exp  = data.get('exp')

    conn = db_conn()
    cursor = conn.cursor()

    user = cursor.execute(
        'SELECT * FROM inventory WHERE id = ?',
        (id,)
    ).fetchone()

    if user is None:
        conn.close()
        return jsonify({'error': 'Item not found'}), 404

    cursor.execute('''
        UPDATE inventory
        SET name = ?, desc = ?, exp = ?
        WHERE id = ?
    ''', (name, desc, exp, id))

    conn.commit()
    conn.close()

    return jsonify({'message': 'item updated'})

@app.route('/users/<int:id>', methods=['DELETE'])
def delete_item(id):
    conn = db_conn()
    cursor = conn.cursor()

    result = cursor.execute(
        'DELETE FROM inventory WHERE id = ?',
        (id,)
    )

    conn.commit()
    conn.close()

    if result.rowcount == 0:
        return jsonify({'error': 'Item not found'}), 404

    return jsonify({'message': 'Item deleted'})

if __name__ == '__main__':
    app.run(debug=True)
