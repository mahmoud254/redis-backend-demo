const express = require("express");
const Image = require("../models/image");
const getSingedUrl = require("../helper/pre_signedurl");

const aws = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3-v2');

const redisClient = require("../redis_cache/cache");
const REDIS_HOUR_KEY = 'HourlyImage'

aws.config.update({
    accessKeyId: process.env.ACCESS_KEY_ID,
    secretAccessKey: process.env.SECRET_ACCESS_KEY,
    region: process.env.REGION
});

const s3 = new aws.S3();
const router = new express.Router();

const upload = multer({
    storage: multerS3({
      s3: s3,
      bucket: process.env.BUCKET_NAME,
      ACL: 'public-read', // private
      metadata: function (req, file, cb) {
        console.log(`file data while uploading: ${file}`);
        cb(null, {fieldName: file.fieldname});
      },
      key: function (req, file, cb) {
        cb(null, file.originalname)
      }
    })
  })
// const singleUpload = upload.single('image')

router.post(
    '/images',
    upload.single('image'),
    async (req, res) => {
        // req_file = req.file
        // console.log(req_file)
        fileOrignalName = req.file.originalname
        fileS3Key = req.file.key
        fileS3Uri = req.file.location
        image_body = {
            "name": fileOrignalName,
            "s3Uri": fileS3Uri,
            's3Key': fileS3Key,
            'extension': fileOrignalName.split('.').pop()
        }
        const image = new Image(image_body);
        try{
            await image.save();
        }catch(error){
            res.status(400).send({
                "error": "Image already exists!"
            });
        }
        
        return res.json({'imageUrl': fileS3Uri});
    },
    (error, req, res, next) => {
        res
          .status(400)
          .send({ error: error });
      }
)

router.get("/images/:name", async (req, res)=>{
    // const _id = req.params.id;
    // redisClient
    const name = req.params.name;
    let image;
    try{
        const cacheResults = await redisClient.get(name);
        if (cacheResults) {
            console.log(`Image ${name} found on redis server!`)
            image = JSON.parse(cacheResults);
            await redisClient.set(REDIS_HOUR_KEY, JSON.stringify(image), {
                EX: process.env.EXPIRY, // 3600
                NX: false,
            });
        }else{
            console.log(`Image ${name} doesn't exist on redis server!`)
            image = await Image.findOne({name});
            if (image) {
                console.log(`Tring to set image ${name} on redis server.`)
                await redisClient.set(name, JSON.stringify(image), {
                    EX: process.env.EXPIRY, // 3600
                    NX: true,
                });
                await redisClient.set(REDIS_HOUR_KEY, JSON.stringify(image), {
                    EX: process.env.EXPIRY, // 3600
                    NX: false,
                });
                console.log(`Successfully set image ${name} on redis server.`)
            }else{
                console.log("Image doesn't exisit in redis or database");
            }
        }
        if(!image){
            res.status(404).send();
            return;
        }
        res.status(200).send(image);
    }catch{
        res.status(500).send();
    }
});

router.get("/imagesHour", async (req, res)=>{
    let image;
    try{
        const cacheResults = await redisClient.get(REDIS_HOUR_KEY);
        if (cacheResults) {
            console.log(`hourly image found on redis server!`)
            image = JSON.parse(cacheResults);
            const signedUrl = getSingedUrl(s3, process.env.BUCKET_NAME, image.s3Key, Number(process.env.EXPIRY));
            image['singleURL'] = signedUrl;
            res.status(200).send(image);
        }if(!image){
            console.log("No hourly images exisit in redis!");
            res.status(404).send();
            return;
        }
    }catch{
        res.status(500).send();
    }
});

module.exports = router;