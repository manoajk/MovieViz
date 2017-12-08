from app import app
from flask import redirect, render_template, request, session, url_for
from modules import database as db
from clustering import clustering
import json

@app.route('/')
@app.route('/MovieViz')
def movie_viz():
	attributes = ['genre', 'runtime', 'userRating', 'releaseMonth', 'budget']
	attr_dict = {
		'genre': ['Genre'],
		'runtime': ['Runtime', 'mins'],
		'userRating': ['User Rating', 'stars'],
		'releaseMonth': ['Release Month'],
		'budget': ['Budget', '($M)']
	}
	return render_template("sahaj.html", attributes=attributes,
											attr_dict=attr_dict)

@app.route('/getAllMovies')
def getAllMovies():
	movies = db.getAllMovies()
	movieData = json.dumps(movies)
	return movieData

@app.route('/imdbScraper')
def imdbScraper():
	scrape()
	return 'False'

@app.route('/cluster', methods=["GET","POST"])
def cluster():
	data = request.form.to_dict()["data"]
	dataDict = json.loads(data)
	clusters = clustering(dataDict)
	clusterData = json.dumps(clusters)
	return clusterData
