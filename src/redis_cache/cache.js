const redis = require("redis");


let redisClient;

(async () => {
  redisClient = redis.createClient({
    url: process.env.REDIS_URL
});

  redisClient.on("error", (error) => console.error(`Error : ${error}`));

  await redisClient.connect();
  console.log("Successfully connected to redis...")
})();


module.exports = redisClient;