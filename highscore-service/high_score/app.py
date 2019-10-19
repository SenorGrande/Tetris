import json
import os
import boto3

def lambda_handler(event, context):
    
    tableName = os.environ['TABLE_NAME']
    statusCode = 200
    statusMsg = ''
    dynamodb = boto3.client('dynamodb')

    endpoint = ''
    if ('path' in event):
        endpoint = event['path']

    if (endpoint == '/get-hs'):
        # Get High Score
        statusMsg = dynamodb.get_item(TableName=tableName, Key={'itemId':{'S':'Test'}})
    elif (endpoint == '/update-hs'):
        # Update High Score in Dynamo
        # { "score": 5}
        if ('queryStringParameters' in event):
            postData = event['queryStringParameters']
            if ('score' in postData):
                # POST postData['score'] to the table
                statusMsg = 'Successful POST request'
                score = str(postData['score'])
                dynamodb.put_item(TableName=tableName, Item={'itemId':{'S':'Test'},'score':{'N':score}})

    return {
        "statusCode": statusCode,
        "body": json.dumps({
            "message": statusMsg,
        }),
    }
