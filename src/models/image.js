const mongoose = require("mongoose");

const imageSchema = new mongoose.Schema({  
    name: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    s3Uri: {
        type: String,
        required: true,
        trim: true
    },
    s3Key: {
        type: String,
        required: true,
        trim: true
    },
    extension: {
        type: String,
        required: true,
        trim: true
    },
});

imageSchema.methods.toJSON = function(){
    const image = this.toObject();
    return image;
};


// imageSchema.statics.random = async () => {
//     const images = await Image.aggregate([{ $sample: { size: 1 } }]);
//     let image;
//     try{
//         image = await Image.findById(images[0]._id)
//     }catch(err){
//         console.log(err);
//     }
//     return image;
// };

imageSchema.statics.random = async () => {
    const images = await Image.aggregate([{ $sample: { size: 1 } }]);
    return images[0];
};

const Image = mongoose.model("Image", imageSchema);

module.exports = Image;