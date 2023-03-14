import boto3
import os
import json
import base64

# Function that endodes a string to base 64
def enc_64(message):
  message_bytes = message.encode('ascii')
  base64_bytes = base64.b64encode(message_bytes)
  base64_message = base64_bytes.decode('ascii')
  return base64_message 
 
# Secret name of the sectet you want to get from secret manager
secret_name = "TEST"

# Name of the region the secret is created in
region_name = "eu-central-1"

# Path of the secrets file you want to inject the values into
# secret_file_path = "../Kubernetes/dev/secrets.yml"
secret_file_path = "./secrets.yml"
# secret_file_path = "./secrets.yml"

# Conecting to secret manager and getting the secret values
client = boto3.client('secretsmanager',region_name=region_name)
response = client.get_secret_value(
    SecretId=secret_name
)

# The secret retrieved as key/valye pair
secret_dict=json.loads(response["SecretString"])

# Opening the file and substituting the values from the file with base 64 encoded values
content=open(secret_file_path,"r").read()
content=content.replace("PORT_VALUE",enc_64(secret_dict["PORT"]))
content=content.replace("MONGOOSE_URL_VALUE",enc_64(secret_dict["MONGOOSE_URL"]))
content=content.replace("ACCESS_KEY_ID_VALUE",enc_64(secret_dict["ACCESS_KEY_ID"]))
content=content.replace("SECRET_ACCESS_KEY_VALUE",enc_64(secret_dict["SECRET_ACCESS_KEY"]))
content=content.replace("REGION_VALUE",enc_64(secret_dict["REGION"]))
content=content.replace("BUCKET_NAME_VALUE",enc_64(secret_dict["BUCKET_NAME"]))
content=content.replace("REDIS_URL_VALUE",enc_64(secret_dict["REDIS_URL"]))
content=content.replace("EXPIRY_VALUE",enc_64(secret_dict["EXPIRY"]))

# Saving values
open(secret_file_path,"w").write(content)
