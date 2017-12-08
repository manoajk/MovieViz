DESCRIPTION

Our package is a Flask Application



INSTALLATION
Our application uses python3.6 and pip9.0.1 for python3.6. Make sure `python` and `pip` commands described below use the appropriate versions.
1. Go into the `CODE` directory in the terminal. 
2. Run the following command: `pip install -r requirements.txt` to install all the necessary libraries.


EXECUTION
1. Go into the `CODE` directory in the terminal.
2. Run the following command: `export FLASK_APP=main.py` or
   (If you have Windows, you need to run: `set FLASK_APP=main.py`)
3. Run the following command: `flask run` and you should see the following on your terminal: 
 * Serving Flask app "main"
 * Running on http://127.0.0.1:5000/ (Press CTRL+C to quit)
4. Visit "http://127.0.0.1:5000/" in your browser (we used chrome) to see the application.

5. If the steps 2-3 do not work for you, run the following command instead: `python main.py`
   Again, visit "http://127.0.0.1:5000/" in your browser (we used chrome) to see the application.