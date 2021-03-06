DESCRIPTION

Our package is a Flask Application, which runs the back-end logic in Python and visualizes our findings in D3.js. All references to files below assume you are viewing within the `CODE` directory.

The clustering portion of our project is the most computationally intensive, and so the `clustering.py` uses a method-driven approach to cluster given our inputs and desired filters. `config.py` serves to set up the database connection to our SQLite database held in `main.db`

`main.py` and `__init__.py` are the files that drive the application, but the file that handles the communication between Python and HTML is `app/views.py`. `app/templates` holds the HTML files (which in this case is only `movieviz.html`) that our application runs. Our JavaScript and CSS files are held in `app/static/js` and `app/static/css` respectively, where the HTML files can refer to for external usage.


INSTALLATION
Our application uses python3.6 and pip9.0.1 for python3.6. Make sure `python` and `pip` commands described below use the appropriate versions (which might mean using `python3` and `pip3` instead).
1. Go into the `CODE` directory in the terminal. 
2. Run the following command: `pip install -r requirements.txt` to install all the necessary libraries.


EXECUTION
1. Go into the `CODE` directory in the terminal.
2. Run the following command: `export FLASK_APP=main.py` or
   (If you have Windows, you need to run: `set FLASK_APP=main.py`)
3. Run the following command: `flask run` and you should see the following on your terminal: 
 * Serving Flask app "main"
 * Running on http://127.0.0.1:5000/ (Press CTRL+C to quit)
4. Visit "http://127.0.0.1:5000/" in your browser (we used Chrome) to see the application.

5. If the steps 2-3 do not work for you, run the following command instead: `python main.py`
   Again, visit "http://127.0.0.1:5000/" in your browser (we used Chrome) to see the application.