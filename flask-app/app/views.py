from app import app
from flask import redirect, render_template, request, session, url_for
from modules import database as db

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
	return render_template("sahaj.html")

@app.route('/sana')
def sana():
	return render_template("sana.html")

@app.route('/manoaj')
def manoaj():
	return render_template("manoaj.html")