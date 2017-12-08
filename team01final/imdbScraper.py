from bs4 import BeautifulSoup
from requests import get
from modules import database

# File used to run different functions that scrape the imdb page

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

def getMovieAwards(titleID):
	url = getMovieURL(titleID)
	html_doc = getPageText(url)
	soup = BeautifulSoup(html_doc, 'html.parser')

	awardsSpan = soup.findAll('span', {'itemprop':'awards'})
	numWins = 0
	numNominations = 0
	if len(awardsSpan) == 2:
		awardsSpan = awardsSpan[1]
	elif len(awardsSpan) == 1:
		awardsSpan = awardsSpan[0]
	else:
		awardsSpan = None

	words = awardsSpan.getText().split(' ') if awardsSpan else []
	print(words)
	for i,word in enumerate(words):
		if 'win' in word:
			numWins = int(words[i-1])
		elif 'nomination' in word:
			numNominations = int(words[i-1])

	return (numWins, numNominations)


def getAllMovieDates():
	titleIDs = []

	# Get all movies from sql table
	database.getCursor().execute("SELECT `tconst` FROM movies")
	titleIDs = database.getCursor().fetchall()

	for titleID in titleIDs:
		date = getMovieDate(titleID[0])
		# Update date column in sql table
		database.getCursor().execute("UPDATE movies SET `date`=? WHERE `tconst`=?", [date, titleID[0]])

		# Commit sql changes
		database.getDB().commit()

def getAllMovieRatings():
	titleIDs = []

	# Get all movies from sql table
	database.getCursor().execute("SELECT `tconst` FROM movies")
	titleIDs = database.getCursor().fetchall()

	for titleID in titleIDs:
		rating = getMovieMPAARating(titleID[0])
		# Update date column in sql table
		database.getCursor().execute("UPDATE movies SET `mpaaRating`=? WHERE `tconst`=?", [rating, titleID[0]])

		# Commit sql changes
		database.getDB().commit()

def getAllMovieAwards():
	titleIDS = []

	# Get all movies from sql table
	database.getCursor().execute("SELECT `tconst` FROM movies")
	titleIDs = database.getCursor().fetchall()

	for titleID in titleIDs:
		print(titleID)
		awards = getMovieAwards(titleID[0])
		# Update awards columns in sql table
		database.getCursor().execute("UPDATE movies SET `wins`=?,`nominations`=? WHERE `tconst`=?", [awards[0], awards[1], titleID[0]])

		# Commit sql changes
		database.getDB().commit()

def scrape():
	getAllMovieAwards()
# print("Getting mpaa ratings")
# getAllMovieRatings()
# print("Getting movie dates")
# getAllMovieDates()