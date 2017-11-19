import sqlite3
from flask import g
from config import Config
from app import app

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