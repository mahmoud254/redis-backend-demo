# Cat API

This repo is home to any and all code related to cat api. It contains the application code as well the pipelines files (in AWS folder)
and the kubernetes manifests (in Kubernetes folder).

# Architecture
![Alt text](./docs/node_js_infra.png?raw=true "Architecture")

# Prerequisites:
1. npm  ---> https://docs.npmjs.com/cli/v6/commands/npm-install
2. NodeJs  ---> https://nodejs.org/en/download/
3. Docker |Optional| ---> https://docs.docker.com/engine/install/
4. AWS CLI |Optional| ---> https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html


# Exploring the Repo

This is a simple node js (express) app, but there are some folders that needs a little explainig:
1. AWS  --->  this folder has the buildspec files need for creating the pipelines (in AWS CodeBuild)
2. docs  ---> has the Architecture diagram.
3. Kubernetes ---> contains the eks manifests files 
4. public ---> has the static files (html,css,js,...)
5. src ---> has the application code (models, routers,...)
6. tests ---> has the unit tests to test the app

Please note brefore running the application, some values must be exposed (environment variables).
In the next section we will see those variables and what they mean.

# Environment variables needed for the stack

| variable | description | example |
| --------------- | --------------- | --------------- |
| PORT | The port you want the express server to listen on | 3002 |
| MONGOOSE_URL | The mongodb database url | mongodb://localhost:27017/images_database |
| ACCESS_KEY_ID | The aws access key | BLU5R2XXXXXXXXXXX |
| SECRET_ACCESS_KEY | The aws secret key | XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX |
| REGION | The Region where the bucket is created | eu-central-1 |
| BUCKET_NAME | The name of the bucket that has the cat images | my-test-bucket |
| REDIS_URL | The connection string for the redis database | redis://localhost:6379 |
| EXPIRY | Time is seconds to expire data stored in redis (cache invalidation time) | 3600 |
<br/>

# Example of running the app

```bash
cat << EOT > values.sh
#! /bin/bash
export PORT='3002'
export MONGOOSE_URL='mongodb://localhost:27017/images_database'
export ACCESS_KEY_ID='XXXXXXXXX'
export SECRET_ACCESS_KEY='XXXXXXXXXXXXXXXXXXXXXXXXXXX'
export REGION='eu-central-1'
export BUCKET_NAME='test-redis-backend_test'
export REDIS_URL='redis://localhost:6379'
export EXPIRY='60'
EOT
```

```bash
chmod u+x values.sh && . values.sh
```

```bash
npm install
```

```bash
npm start
```
### If you want to run the unit tests

```bash
npm test
```

# API Endpoints
This api has 3 endpoints, we will go througth them

## Post a cat image

### Request

`Post /images`

    body has the image to upload

### Response
    status: 200
    {
        "imageUrl": "https://test-redis-backend.s3.eu-central-1.amazonaws.com/1678648970252"
    }

## Get an image by name

### Request

`get /images/<:name>`

    Returns json object for the image

### Response
    status: 200
    {
        "_id": "640e3d5e2b0778f87e63b44d",
        "name": "cat_3.jpg",
        "s3Uri": "https://test-redis-backend.s3.eu-central-1.amazonaws.com/cat_3.jpg",
        "s3Key": "cat_3.jpg",
        "extension": "jpg",
        "__v": 0
    }

## Get image of the hour

### Request

`get /imagesHour`

    Returns json object for the image of the hour

### Response
    status: 200
    {
        "_id": "640e3d5e2b0778f87e63b44d",
        "name": "cat_2.jpg",
        "s3Uri": "https://test-redis-backend.s3.eu-central-1.amazonaws.com/cat_3.jpg",
        "s3Key": "cat_3.jpg",
        "signedUrl": "S3_SINGED_URL"
        "extension": "jpg",
        "__v": 0
    } 

# API Endpoints - In Depth

1. 'GET /images/:image_name' endpoint first checks redis if the images exists,
   if it does it returns it, if not it checks MongoDB, if found in mongo then it returns it
   and cache it for an hour.
2. 'GET /imagesHour' works by checking a key in redis (hourlyImageKey for example), if found then
    an image is returend, if not then a random image will be picked from the MongoDb, cached for
    an hour by setting that key (hourlyImageKey), then finally we return the image json object.
3. 'GET /imagesHour' has a field called 'signedUrl' in its response, this is an s3 pre_signed url link
    that expires in an hour and it should be used in the frontend to display the image. The 's3Uri' should
    not be used as you will get an error because the s3 bucket is private.

# Note about the EKS manifests
in the maifests folder there's a file to deploy ingress.yaml for the application, it's working and 
we have in our cluster an nginx and an alb ingress, I am not applying the ingress file in the pipeline
and just using a service of type LoadBalancer. If an ingress is to be used, change the service type to be
- NodePort ---> for ALB ingress
- ClusterIP or NodePort  ---> for Nginx Ingress
