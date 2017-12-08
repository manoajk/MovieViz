from app import app
from flask import redirect, render_template, request, session, url_for
from modules import database as db
from imdbScraper import scrape
from clustering import clustering
import json

@app.route('/')
def front_page():
	statement = "Howdy CX4242 Group 01!"
	return render_template("index.html", statement=statement)

@app.route('/sahaj')
def sahaj():
	attributes = ['genre', 'runtime', 'userRating', 'releaseMonth', 'budget']
	return render_template("sahaj.html",attributes=attributes)

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
