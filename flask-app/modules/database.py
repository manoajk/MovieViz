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

def getAllMovies():
    getCursor().execute("SELECT * FROM movies")
    movies = getCursor().fetchall()

    movieList = []
    for movie in movies:
        movieDict = {}
        movieDict['budget'] = movie[4]

        genres = movie[9].split(',')
        movieDict['genre1'] = genres[0] if len(genres) > 0 else ""
        movieDict['genre2'] = genres[1] if len(genres) > 1 else ""
        movieDict['genre3'] = genres[2] if len(genres) > 2 else ""
        movieDict['primaryTitle'] = movie[2]
        movieDict['revenue'] = movie[14]
        movieDict['runtimeMinutes'] = movie[8]
        movieDict['startYear'] = movie[12]
        movieDict['day'] = movie[11]
        movieDict['month'] = movie[10]
        movieDict['tconst'] = movie[0]

        movieList.append(movieDict)

    return movieList


@app.teardown_appcontext
def close_connection(exception):
    db = getattr(g, '_database', None)
    if db is not None:
        db.close()