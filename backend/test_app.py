# Unit tests for the Flask CRUD API in app.py.
# Each test runs against a fresh, temporary SQLite database so the real
# inventory.db is never touched and tests do not leak state into each other.

import os
import sqlite3
import tempfile
from datetime import date, timedelta

import pytest

import app as app_module


# Path to the schema file, resolved relative to this test file so the
# tests can be run from any working directory.
SCHEMA_PATH = os.path.join(os.path.dirname(__file__), 'schema.sql')


@pytest.fixture
def client():
    """Provide a Flask test client backed by a fresh temp SQLite database.

    For every test we:
      1. Create a brand-new temp .db file.
      2. Apply schema.sql to it so the `inventory` table exists and is empty.
      3. Monkey-patch `app.DB` so the app's db_conn() opens our temp file
         instead of the real inventory.db.
      4. Yield Flask's test client to the test.
      5. Restore the original DB path and delete the temp file.
    """
    db_fd, db_path = tempfile.mkstemp(suffix='.db')
    os.close(db_fd)

    # Initialize the temp database with the project schema.
    conn = sqlite3.connect(db_path)
    with open(SCHEMA_PATH) as f:
        conn.executescript(f.read())
    conn.commit()
    conn.close()

    # Redirect the app to the temp database for the duration of the test.
    original_db = app_module.DB
    app_module.DB = db_path
    app_module.app.config['TESTING'] = True

    with app_module.app.test_client() as client:
        yield client

    # Cleanup: restore the original DB path and remove the temp file.
    app_module.DB = original_db
    os.remove(db_path)


def seed(client, name='Apple', desc='An apple', exp='2030-01-01'):
    """Helper that POSTs an item via the API and returns its new id.

    Using the API (rather than writing directly to SQLite) keeps the seed
    path realistic and reuses the same code paths the tests exercise.
    """
    response = client.post('/items', json={'name': name, 'desc': desc, 'exp': exp})
    return response.get_json()['id']


def test_index(client):
    # The root route is a placeholder; verify it responds 200 and points
    # the user toward the /items endpoint.
    response = client.get('/')
    assert response.status_code == 200
    assert b'/items' in response.data


def test_get_items_empty(client):
    # READ — with an empty database, GET /items must return an empty list,
    # not 404 or an error.
    response = client.get('/items')
    assert response.status_code == 200
    assert response.get_json() == []


def test_get_items_returns_seeded(client):
    # READ — after inserting two items, GET /items should return both with
    # the expected JSON shape (id, name, desc, exp).
    seed(client, name='Apple', desc='An apple', exp='2030-01-01')
    seed(client, name='Banana', desc='A banana', exp='2030-02-01')

    response = client.get('/items')
    assert response.status_code == 200
    items = response.get_json()
    assert len(items) == 2
    names = {item['name'] for item in items}
    assert names == {'Apple', 'Banana'}
    # Guard against accidental schema drift in the response payload.
    for item in items:
        assert set(item.keys()) == {'id', 'name', 'desc', 'exp'}


def test_create_item_success(client):
    # CREATE — happy path: POST returns 201 with the created row echoed
    # back, and the row is actually persisted (verified via GET).
    response = client.post('/items', json={
        'name': 'Carrot',
        'desc': 'A carrot',
        'exp': '2030-05-05',
    })
    assert response.status_code == 201
    body = response.get_json()
    assert body['name'] == 'Carrot'
    assert body['desc'] == 'A carrot'
    assert body['exp'] == '2030-05-05'
    assert isinstance(body['id'], int)

    # Confirm the item is actually in the DB, not just echoed.
    items = client.get('/items').get_json()
    assert len(items) == 1
    assert items[0]['id'] == body['id']


def test_create_item_defaults_exp_when_missing(client):
    # CREATE — the API defaults `exp` to today + 7 days when not supplied.
    # This pins that behavior so a future change to the default is a
    # deliberate decision, not a silent regression.
    response = client.post('/items', json={'name': 'Donut', 'desc': 'A donut'})
    assert response.status_code == 201
    body = response.get_json()
    expected = (date.today() + timedelta(days=7)).isoformat()
    assert body['exp'] == expected


def test_create_item_missing_name_returns_400(client):
    # CREATE — `name` is required; omitting it must produce a 400 error
    # rather than inserting a half-formed row.
    response = client.post('/items', json={'desc': 'No name', 'exp': '2030-01-01'})
    assert response.status_code == 400
    assert response.get_json() == {'error': 'Missing data'}


def test_create_item_missing_desc_returns_400(client):
    # CREATE — `desc` is also required; same 400 contract as missing name.
    response = client.post('/items', json={'name': 'Eggs', 'exp': '2030-01-01'})
    assert response.status_code == 400
    assert response.get_json() == {'error': 'Missing data'}


def test_update_item_success(client):
    # UPDATE — happy path: PUT changes all three mutable fields and the
    # change is reflected in a subsequent GET.
    item_id = seed(client, name='Apple', desc='An apple', exp='2030-01-01')

    response = client.put(f'/items/{item_id}', json={
        'name': 'Green Apple',
        'desc': 'A green apple',
        'exp': '2031-01-01',
    })
    assert response.status_code == 200
    assert response.get_json() == {'message': 'item updated'}

    # Verify the update actually landed in the database.
    items = client.get('/items').get_json()
    assert len(items) == 1
    updated = items[0]
    assert updated['id'] == item_id
    assert updated['name'] == 'Green Apple'
    assert updated['desc'] == 'A green apple'
    assert updated['exp'] == '2031-01-01'


def test_update_item_not_found_returns_404(client):
    # UPDATE — PUT against a non-existent id must return 404, not silently
    # create a new row or return 200.
    response = client.put('/items/999', json={
        'name': 'Ghost',
        'desc': 'Nope',
        'exp': '2030-01-01',
    })
    assert response.status_code == 404
    assert response.get_json() == {'error': 'Item not found'}


def test_delete_item_success(client):
    # DELETE — happy path: returns 200 and the item is gone from the DB.
    item_id = seed(client)

    response = client.delete(f'/items/{item_id}')
    assert response.status_code == 200
    assert response.get_json() == {'message': 'Item deleted'}

    assert client.get('/items').get_json() == []


def test_delete_item_not_found_returns_404(client):
    # DELETE — deleting a non-existent id must return 404 (relies on
    # SQLite's rowcount being 0 when no row matched).
    response = client.delete('/items/999')
    assert response.status_code == 404
    assert response.get_json() == {'error': 'Item not found'}


def test_delete_only_targets_specified_item(client):
    # DELETE — a delete must remove only the targeted row. Guards against
    # a regression where a missing/wrong WHERE clause could wipe the table.
    keep_id = seed(client, name='Apple', desc='An apple', exp='2030-01-01')
    drop_id = seed(client, name='Banana', desc='A banana', exp='2030-02-01')

    response = client.delete(f'/items/{drop_id}')
    assert response.status_code == 200

    items = client.get('/items').get_json()
    assert len(items) == 1
    assert items[0]['id'] == keep_id
    assert items[0]['name'] == 'Apple'
