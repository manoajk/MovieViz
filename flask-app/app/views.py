from app import app
from flask import redirect, render_template, request, session, url_for
from modules import database as db

@app.route('/')
def front_page():
	statement = "Howdy CX4242 Group 01!"
	return render_template("index.html", statement=statement)
	# return "Howdy CX4242 Group 01!"

@app.route('/SigmaJS_Example')
def sigma_ex():
	return render_template("example_sigma.html")