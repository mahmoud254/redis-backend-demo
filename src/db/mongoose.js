const mongoose = require("mongoose");

const url = process.env.MONGOOSE_URL;
const config = {
    useUnifiedTopology: true,
    // useCreateIndex: true
};

mongoose.connect(url, config);