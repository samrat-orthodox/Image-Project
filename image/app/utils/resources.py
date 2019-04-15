import boto3
import json


def push_obj_to_s3(key, s3_object, bucket, config):
    try:
        s3_client = boto3.client('s3', region_name=config['region_name'])
        resp = s3_client.put_object(Body=json.dumps(s3_object), Key=key, Bucket=bucket)
        return {'success': True, 'data': 'Push to s3 successful'}
    except Exception as e:
        return {'success': False, 'data': str(e)}

