from app import app
from flask import redirect, render_template, request, session, url_for
from modules import database as db

@app.route('/')
def front_page():
	return "Howdy CX4242 Group 01!"