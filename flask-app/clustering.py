from pandas import read_csv
from pandas import DataFrame
import pandas as pd
import numpy as np
from time import time
from sklearn.cluster import k_means
from sklearn.mixture import GaussianMixture
from sklearn.preprocessing import MultiLabelBinarizer
from sklearn.decomposition import PCA
from sklearn import metrics
from scipy.stats import kurtosis,kurtosistest
from matplotlib import pylab as pl
from modules import database as db
import sys

# dtype = {"tconst":str, "titleType":str, "primaryTitle":str, "originalTitle":str, "isAdult": str, "startYear":str, "endYear":str, "runtimeMinutes": str, "genres":str}
# movieDataFrame = read_csv("data/title.basics.tsv", sep="\t", header=0, dtype=dtype, na_values="\\N")
# movieDataFrame = movieDataFrame[movieDataFrame.titleType == "movie"][movieDataFrame.startYear >= "2000"]
# movies = np.random.choice(np.asarray(movieDataFrame['tconst']), 2000)
# print(movies)
# print(len(movies))
# genres = np.asarray(movieDataFrame.loc[movieDataFrame['tconst'].isin(movies)].pop('genres'))
# print(len(genres))

# genresArray = []
# for g in genres:
# 	if type(g) == str:
# 		genresArray += [g.split(",")]
# 	else:
# 		genresArray += [[]]

KMeansRandLabels = None
KMeansPlusLabels = None
EMRandLabels = None
EMKMeansLabels = None

def clustering():
	command = "SELECT movies.tconst,ratings.averageRating,`runtimeMinutes`,`Budget($M)` FROM movies INNER JOIN ratings ON movies.tconst=ratings.tconst ORDER BY movies.tconst"

	db.getCursor().execute(command)
	movies = db.getCursor().fetchall()

	attrs = [[],[],[]]
	movieIds = []
	for movie in movies:
		movieIds.append(movie[0])
		attrs[0].append([movie[1]])
		attrs[1].append([movie[2]])
		attrs[2].append([movie[3]])

	dataDict = {}
	for i,attr in enumerate(attrs):
		trials = 1
		maxSilhouetteScore = -1
		maxK = 2
		for k in range(2,11):
			silhouetteScore = 0
			for j in range(trials):
				results = k_means(attr, n_clusters=k, init='random')
				silhouetteScore += metrics.silhouette_score(attr, results[1], metric='euclidean')

			silhouetteScore /= trials
			if silhouetteScore > maxSilhouetteScore:
				maxSilhouetteScore = silhouetteScore
				maxK = k

		results = k_means(attr, n_clusters=maxK, init='random')
		labels = results[1]
		clusters = results[0]

		dataDict[i] = {}

		clustersMin = [sys.maxsize] * maxK
		clustersMax = [0] * maxK
		dataDict[i]["clusters"] = []
		for j, label in enumerate(labels):
			if attr[j][0] < clustersMin[label]:
				clustersMin[label] = attr[j][0]
			if attr[j][0] > clustersMax[label]:
				clustersMax[label] = attr[j][0]

		for j in range(maxK):
			dataDict[i]["clusters"].append(str(clustersMin[j]) + " - " + str(clustersMax[j]))

		for j, label in enumerate(labels):
			dataDict[i][movieIds[j]] = int(label)

	return dataDict



def clusterCategorical():
	db.getCursor().execute("SELECT `tconst`,`genres` FROM movies")
	movies = db.getCursor().fetchall()

	clusterDict = {}

	genres= []
	movieIds = []
	for movie in movies:
		movieIds.append(movie[0])
		genres.append(movie[1].split(','))

	mlb = MultiLabelBinarizer()
	encoded = mlb.fit_transform(genres)

	genrePCA = PCA(n_components=2)
	genreTransformed = genrePCA.fit_transform(encoded)

	print('Clustering')

	results = k_means(encoded, n_clusters=5, init='random', return_n_iter=True)
	KMeansRandLabels = results[1]
	transformedResults = k_means(genreTransformed, n_clusters=5, init='random', return_n_iter=True)
	transformedLabels = transformedResults[1]
	transformedClusters = transformedResults[0]

	print('Done Clustering')

	output_list = []
	output_dict = {"name": "All Movies"}
	clusters = {}

	for i,label in enumerate(transformedLabels):
		size = float(label) if not np.isnan(float(label)) else 0
		if str(label) in clusters:
			dataDict = {}
			dataDict['x'] = genreTransformed[i, 0]
			dataDict['y'] = genreTransformed[i, 1]
			dataDict['name'] = str(label)
			dataDict['movieID'] = movieIds[i]
			dataDict['size'] = size + 0.5
			clusters[str(label)]['children'].append(dataDict)

			# newDict = {movieIds[i] : dataDict}
			# # clusters[str(label)]['children'].append(newDict)
			# # # clusters[str(label)]['children'][movieIds[i]] = dataDict
		else:
			dataDict = {}
			print("label", str(label))
			dataDict['x'] = genreTransformed[i, 0]
			dataDict['y'] = genreTransformed[i, 1]
			dataDict['name'] = str(label)
			dataDict['movieID'] = movieIds[i]
			dataDict['size'] = size + 0.5
			clusters[str(label)] = {"name": str(label)}
			# newDict = {movieIds[i] : dataDict}
			clusters[str(label)]['children'] = []
			clusters[str(label)]['children'].append(dataDict)
			
			print("List", clusters[str(label)]['children'])


	print(transformedClusters)
	for i,cluster in enumerate(transformedClusters):
		print(i)
		print(cluster)
		clusters[str(i)]['x'] = cluster[0]
		clusters[str(i)]['y'] = cluster[1]

	cluster_list = []
	for cluster_key in clusters:
		# print("CLUSTER_MANOAJ", cluster, tuple(clusters[cluster_key]))
		# print("CLUSTER_MANOAJ", type(cluster), type(clusters[cluster_key]))
		cluster_list.append({str(cluster): tuple(clusters[cluster_key])})
	output_dict["children"] = cluster_list
	output_list.append(output_dict)
	output = [{"name": "flareAnalytics", "children": output_list}]
	return output

	# pl.figure("K-Means: Random Init")
	# pl.scatter(genreTransformed[:, 0], genreTransformed[:, 1], c=KMeansLabels)

	# pl.figure("K-Means: Random Init Transformed")
	# pl.scatter(genreTransformed[:, 0], genreTransformed[:, 1], c=transformedLabels)
	# pl.show()




## CLUSTERING -----------------------------------------------------------------------------------------------------
def clusterTest(sampleData):
	max_num_clusters = 5

	## KMEANS: RANDOM INITIALIZATION ------------------------------
	print('KMeans: Random Initialization')
	print('K Value,Time(seconds),Iterations,Inertia,Silhouette Score')

	maxKMeansRandSScore = 0
	maxKMeansRandSScoreNum = 0
	trials = 10

	for i in range((max_num_clusters-1)):
		t = 0
		iterations = 0
		inertia = 0
		silhouette_score = 0
		for j in range(trials):
			t0 = time()
			results = k_means(sampleData, n_clusters=i+2, init='random', return_n_iter=True)
			t += time()-t0
			iterations += results[3]
			inertia += results[2]
			silhouette_score += metrics.silhouette_score(sampleData, results[1], metric='euclidean')
		t /= trials
		iterations /= trials
		inertia /= trials
		silhouette_score /= trials

		print('%i,%.2f,%i,%i,%.3f'
			% (i+2,t,iterations,inertia,silhouette_score))
		if silhouette_score > maxKMeansRandSScore:
			maxKMeansRandSScore = silhouette_score
			maxKMeansRandSScoreNum = i+2

	print('max S_Score:,%i,%.3f' % (maxKMeansRandSScoreNum, maxKMeansRandSScore))

	# ## KMEANS: KMEANS++ INITIALIZATION ------------------------------
	# print('KMeans: KMeans++ Initialization')
	# print('K Value,Time(seconds),Iterations,Inertia,Silhouette Score')

	# maxKMeansPlusSScore = 0
	# maxKMeansPlusSScoreNum = 0
	# trials = 1

	# for i in range((max_num_clusters-1)):
	# 	t = 0
	# 	iterations = 0
	# 	inertia = 0
	# 	silhouette_score = 0
	# 	for j in range(trials):
	# 		t0 = time()
	# 		results = k_means(sampleData, n_clusters=i+2, init='k-means++', return_n_iter=True)
	# 		t += time()-t0
	# 		iterations += results[3]
	# 		inertia += results[2]
	# 		silhouette_score += metrics.silhouette_score(sampleData, results[1], metric='euclidean')
	# 	t /= trials
	# 	iterations /= trials
	# 	inertia /= trials
	# 	silhouette_score /= trials

	# 	print('%i,%.2f,%i,%i,%.3f'
	# 		% (i+2,t,iterations,inertia,silhouette_score))
	# 	if silhouette_score > maxKMeansPlusSScore:
	# 		maxKMeansPlusSScore = silhouette_score
	# 		maxKMeansPlusSScoreNum = i+2

	# print('max S_Score:,%i,%.3f' % (maxKMeansPlusSScoreNum, maxKMeansPlusSScore))

	# ## EM: RANDOM INITIALIZATION ------------------------------
	# print('EM: Random Initialization')
	# print('Number of Clusters,Time(seconds),Iterations,Silhouette Score')

	# maxEMRandSScore = 0
	# maxEMRandSScoreNum = 0
	# trials = 3

	# for i in range((max_num_clusters-1)):
	# 	t = 0
	# 	iterations = 0
	# 	silhouette_score = 0
	# 	for j in range(trials):
	# 		t0 = time()
	# 		estimator = GaussianMixture(n_components=i+2, n_init=10, max_iter=300, init_params='random')
	# 		estimator.fit(sampleData)
	# 		t += time()-t0
	# 		estimatorLabels = estimator.predict(sampleData)
	# 		iterations += estimator.n_iter_
	# 		silhouette_score += metrics.silhouette_score(sampleData, estimatorLabels, metric='euclidean')
	# 	t /= trials
	# 	iterations /= trials
	# 	silhouette_score /= trials

	# 	print('%i,%.2f,%i,%.3f'
	# 		% (i+2,t,iterations,silhouette_score))
	# 	if silhouette_score > maxEMRandSScore:
	# 		maxEMRandSScore = silhouette_score
	# 		maxEMRandSScoreNum = i+2

	# print('max S_Score:,%i,%.3f' % (maxEMRandSScoreNum, maxEMRandSScore))

	# ## EM: KMEANS INITIALIZATION ------------------------------
	# print('EM: KMeans Initialization')
	# print('Number of Clusters,Time(seconds),Iterations,Silhouette Score')

	# maxEMKMeansSScore = 0
	# maxEMKMeansSScoreNum = 0
	# trials = 1

	# for i in range((max_num_clusters-1)):
	# 	t = 0
	# 	iterations = 0
	# 	silhouette_score = 0
	# 	for j in range(trials):
	# 		t0 = time()
	# 		estimator = GaussianMixture(n_components=i+2, n_init=10, max_iter=300, init_params='kmeans')
	# 		estimator.fit(sampleData)
	# 		t += time()-t0
	# 		estimatorLabels = estimator.predict(sampleData)
	# 		iterations += estimator.n_iter_
	# 		silhouette_score += metrics.silhouette_score(sampleData, estimatorLabels, metric='euclidean')
	# 	t /= trials
	# 	iterations /= trials
	# 	silhouette_score /= trials

	# 	print('%i,%.2f,%i,%.3f'
	# 		% (i+2,t,iterations,silhouette_score))
	# 	if silhouette_score > maxEMKMeansSScore:
	# 		maxEMKMeansSScore = silhouette_score
	# 		maxEMKMeansSScoreNum = i+2

	# print('max S_Score:,%i,%.3f' % (maxEMKMeansSScoreNum, maxEMKMeansSScore))

	global KMeansRandLabels
	global KMeansPlusLabels
	global EMRandLabels
	global EMKMeansLabels

	results = k_means(sampleData, n_clusters=maxKMeansRandSScoreNum, init='random', return_n_iter=True)
	KMeansRandLabels = results[1]
	# results = k_means(sampleData, n_clusters=maxKMeansPlusSScoreNum, init='k-means++', return_n_iter=True)
	# KMeansPlusLabels = results[1]
	# estimator = GaussianMixture(n_components=maxEMRandSScoreNum, n_init=10, max_iter=300, init_params='random')
	# estimator.fit(sampleData)
	# EMRandLabels = estimator.predict(sampleData)
	# estimator = GaussianMixture(n_components=maxEMKMeansSScoreNum, n_init=10, max_iter=300, init_params='kmeans')
	# estimator.fit(sampleData)
	# EMKMeansLabels = estimator.predict(sampleData)


