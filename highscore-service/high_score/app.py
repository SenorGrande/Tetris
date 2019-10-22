import json
import os
import boto3

def lambda_handler(event, context):
    
    tableName = os.environ['TABLE_NAME']
    statusCode = 200
    statusMsg = ''
    dynamodb = boto3.client('dynamodb')

    currentHighScore = dynamodb.get_item(TableName=tableName, Key={'itemId':{'S':'Test'}})

    endpoint = ''
    if ('path' in event):
        endpoint = event['path']

    if (endpoint == '/get-hs'):
        # Get High Score
        statusMsg = currentHighScore
    elif (endpoint == '/update-hs'):
        # Update High Score in Dynamo
        # { "score": 5}
        if ('body' in event):
            postData = event['body']
            if ('score' in postData):
                statusMsg = 'Successful POST request'
                postData = json.loads(postData)
                score = str(postData['score'])
                if (score > currentHighScore['Item']['score']['N']):
                    dynamodb.put_item(TableName=tableName, Item={'itemId':{'S':'Test'},'score':{'N':score}})

    return {
        "statusCode": statusCode,
        "headers": {
            "Access-Control-Allow-Origin": "*"
        },
        "body": json.dumps({
            "message": statusMsg,
        }),
    }
