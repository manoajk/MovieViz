.headers off
.separator '\t'

create table actors(
	nconst text,
	primaryName text,
	birthYear integer,
	deathYear integer, 
	primaryProfession text,
	knownforTitles text
);
.mode tabs actors
.import name.basics.tsv actors

create table movie(
	tconst text,
	titleType text,
	primaryTitle text,
	originalTitle text,
	isAdult integer,
	startYear integer,
	endYear integer,
	runtimeMinutes integer,
	genres text 
);
.mode tabs movie
.import title.basics.tsv movie

create table ratings(
 	tconst text,
 	averageRating real, 
 	numVotes integer
 );
.mode tabs ratings
.import title.ratings.tsv ratings

create table crew(
	tconst text,
	directors text,
	writers text
);
.mode tabs crew
.import title.crew.tsv crew

create table awards(
	Year integer,
	Ceremony integer,
	Award text,
	Winner integer,
	Name text,
	Film text
	);
.mode tabs awards
.import AcademyAwardData.tsv awards

	