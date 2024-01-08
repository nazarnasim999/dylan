const mongoose = require('mongoose');
const { MONGODB_URI } = require('../config');


mongoose.set("strictQuery", false);
const connectToMongo = () => {
    mongoose.connect(MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
    mongoose.connection.on("connected", () => {
        console.log("mongo connected");
    });

    mongoose.connection.on("error", (err) => {
        console.log(err, "mongo error");
    });
}


module.exports = connectToMongo