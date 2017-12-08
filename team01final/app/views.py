from app import app
from flask import redirect, render_template, request, session, url_for
from modules import database as db
from imdbScraper import scrape
from clustering import clustering

import json

@app.route('/')
@app.route('/MovieViz')
def sahaj():
	attributes = ['genre', 'runtime', 'userRating', 'releaseMonth', 'budget']
	attr_dict = {
		'genre': ['Genre'],
		'runtime': ['Runtime'],
		'userRating': ['User Rating'],
		'releaseMonth': ['Release Month'],
		'budget': ['Budget']
	}
	return render_template("sahaj.html", attributes=attributes,
											attr_dict=attr_dict)

def obj_dict(obj):
    return obj.__dict__

@app.route('/sana')
def sana():

	# movies = db.getAllMovies()
	# movieData = json.dumps(movies)
	# print(movieData)
	return render_template("sana.html")

@app.route('/getAllMovies')
def getAllMovies():
	movies = db.getAllMovies()
	movieData = json.dumps(movies)
	return movieData

@app.route('/manoaj')
def manoaj():
	return render_template("manoaj.html")

@app.route('/imdbScraper')
def imdbScraper():
	scrape()
	return 'False'


@app.route('/cluster')
def cluster():
	clusters = clustering()
	clusterData = json.dumps(clusters)
	return clusterData
