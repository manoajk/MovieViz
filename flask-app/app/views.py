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

@app.route('/miserables')
def miserables():
	return render_template("sample_graph.html")

@app.route('/dhruv')
def dhruv():

	return render_template("dhruv.html")

@app.route('/sahaj')
def sahaj():
	attributes = ['genre', 'runtime', 'userRating', 'releaseMonth', 'budget']
	return render_template("sahaj.html",attributes=attributes)

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


@app.route('/cluster', methods=["GET","POST"])
def cluster():
	data = request.form.to_dict()["data"]
	dataDict = json.loads(data)
	clusters = clustering(dataDict)
	clusterData = json.dumps(clusters)
	return clusterData
