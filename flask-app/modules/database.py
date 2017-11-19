import sqlite3
from flask import g
from config import Config
from app import app

"""
HOW TO USE:
`from modules import database as db`

`db.getCursor().execute("INSERT_SQL_COMMAND_HERE")`
IF SELECT QUERY:
`db.getCursor().fetchall()`
OR IF INSERT OR UPDATE QUERY:
`db.getDB().commit()`

Example:
If you want all movies
`db.getCursor().execute("SELECT * FROM movie")
movies = db.getCursor().fetchall()`

"""

def getDB():
    db = getattr(g, '_database', None)
    if db is None:
        db = g._database = sqlite3.connect(Config.DATABASE_PATH)
    return db

def getCursor():
    db = getDB()

    if not hasattr(g, 'cursor'):
        g.cursor = db.cursor()

    return g.cursor

@app.teardown_appcontext
def close_connection(exception):
    db = getattr(g, '_database', None)
    if db is not None:
        db.close()