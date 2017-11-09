from app import app
from flask import redirect, render_template, request, session, url_for

@app.route('/')
def front_page():
	return "Howdy CX4242 Group 01!"