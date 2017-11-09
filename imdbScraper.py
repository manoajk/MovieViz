from bs4 import BeautifulSoup
from requests import get

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

def getAllMovieDates():
	titleIDs = []

	# TODO: Get all movies from sql table

	for titleID in titleIDs:
		date = getMovieDate(titleID)
		# TODO: Update date column in sql table

	# TODO: Commit sql changes

print(getMovieDate('tt3521164'))