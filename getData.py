import boto3
import botocore
import sys

BUCKET_NAME = 'imdb-datasets'	# replace with your bucket name
KEY = 'documents/v1/current/'	# replace with your object key
FILE = ''
DEFAULT_FILE = 'title.basics.tsv.gz'	# default file to download


# Takes an argument and downloads the specified file
# else it downloads the default file
if len(sys.argv) > 1:
	FILE = sys.argv[1]
else:
	FILE = DEFAULT_FILE

KEY += FILE

s3 = boto3.resource('s3')

try:
	print("Downloading '" + FILE + "' from bucket '" + BUCKET_NAME + "' at key '" + KEY + "'...")
    s3.Bucket(BUCKET_NAME).download_file(KEY, FILE, ExtraArgs={"RequestPayer" : "requester"})
except botocore.exceptions.ClientError as e:
    if e.response['Error']['Code'] == "404":
        print("The object does not exist.")
    else:
        raise