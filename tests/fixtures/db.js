const Image = require("../../src/models/image");
const mongoose = require("mongoose");
const redisClient = require("../../src/redis_cache/cache");

const defaultImageId = new mongoose.Types.ObjectId();

const defaultImage = {
    _id: defaultImageId,
    name: "cat_3.jpg",
    s3Uri: "https://test-redis-backend.s3.eu-central-1.amazonaws.com/cat_3.jpg",
    s3Key: "cat_3.jpg",
    extension: "jpg"
};

async function scanAndDelete(redisClient, pattern) {
    let cursor = '0';
    // delete any paths with query string matches
    const reply = await redisClient.scan(cursor, { MATCH: pattern, COUNT: 1000 });
    for (key of reply.keys) {
      cursor = reply.cursor;
  
      await redisClient.del(key);
    }
  }

const setUpDatabase = async () => {
    await Image.deleteMany();
    await new Image(defaultImage).save();
    await scanAndDelete(redisClient, "*")
    await new Promise(resolve => setTimeout(resolve, 5000));
};

module.exports = {
    defaultImage,
    setUpDatabase,
};