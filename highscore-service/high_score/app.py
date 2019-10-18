import json
import os

def lambda_handler(event, context):
    
    print(event)
    print(os.environ['TABLE_NAME'])

    # Add Dynamo to template
    # POST highscore to template (with test first)
    # GET highscore

    endpoint = event['path']

    statusCode = 200
    statusMsg = ''

    if (endpoint == '/get-hs'):
        # Get High Score
        statusMsg = 'Successful GET request'
    elif (endpoint == '/update-hs'):
        # Update High Score in Dynamo
        # { "score": 5}
        if ('queryStringParameters' in event):
            postData = event['queryStringParameters']
            if ('score' in postData):
                # POST postData['score'] to the table
                statusMsg = 'Successful POST request'


    return {
        "statusCode": statusCode,
        "body": json.dumps({
            "message": statusMsg,
        }),
    }
