from bs4 import BeautifulSoup
from requests import get
from modules import database

def getPageText(url):
    return get(url).text

def getMovieURL(titleID):
	return 'http://www.imdb.com/title/' + titleID

def getNameURL(nameID):
	return 'http://www.imdb.com/name/' + nameID

def getMovieDate(titleID):
	url = getMovieURL(titleID)
	html_doc = getPageText(url)
	soup = BeautifulSoup(html_doc, 'html.parser')

	dateMeta = soup.find('meta', {'itemprop':'datePublished'})

	return dateMeta['content']

def getMovieMPAARating(titleID):
	url = getMovieURL(titleID)
	html_doc = getPageText(url)
	soup = BeautifulSoup(html_doc, 'html.parser')

	ratingMeta = soup.find('meta', {'itemprop':'contentRating'})

	return ratingMeta['content']

def getAllMovieDates():
	titleIDs = []

	# Get all movies from sql table
	database.getCursor().execute("SELECT `tconst` FROM movie")
	titleIDs = database.getCursor().fetchall()

	for titleID in titleIDs:
		date = getMovieDate(titleID[0])
		# Update date column in sql table
		database.getCursor().execute("UPDATE movie SET `date`=%s WHERE `tconst`=%s", date, titleID[0])

	# Commit sql changes
	database.getDB().commit()

def getAllMovieRatings():
	titleIDs = []

	# Get all movies from sql table
	database.getCursor().execute("SELECT `tconst` FROM movie")
	titleIDs = database.getCursor().fetchall()

	for titleID in titleIDs:
		rating = getMovieMPAARating(titleID[0])
		# Update date column in sql table
		database.getCursor().execute("UPDATE movie SET `mpaaRating`=%s WHERE `tconst`=%s", rating, titleID[0])

	# Commit sql changes
	database.getDB().commit()

print("Getting mpaa ratings")
getAllMovieRatings()
print("Getting movie dates")
getAllMovieDates()