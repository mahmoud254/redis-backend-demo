const path = require("path");
require("./db/mongoose");
// require("./redis_cache/cache");

const express = require("express");
const cors = require('cors')
const imageRouter = require("./routers/image");

const app = express();
const mainPageDirectory = path.join(__dirname, "../public");
console.log(mainPageDirectory);
app.use(cors())
app.use(express.static(mainPageDirectory));

// app.use(express.json());
app.use(imageRouter);

module.exports = app;