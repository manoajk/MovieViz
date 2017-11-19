from flask import g, session, flash
# For MySQL integration
from flask.ext.mysql import MySQL

# Needed for MySQL integration
mysql = MySQL()


def getDB():
    """Opens a new database connection if there is none yet for the
    current application context.
    """
    if not hasattr(g, 'mysql_db'):
        g.mysql_db = mysql.connect()

    return g.mysql_db


def getCursor():
    if not hasattr(g, 'mysql_db'):
        g.mysql_db = mysql.connect()

    if not hasattr(g, 'cursor'):
        g.cursor = g.mysql_db.cursor()

    return g.cursor
