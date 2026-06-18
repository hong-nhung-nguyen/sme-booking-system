const Business = require("../../../../models/Business.model");
const mongoose = require("mongoose");

// [GET] api/v1/platform/tenants
module.exports.index = async (req, res) => {
    // console.log("Connected DB: ", mongoose.connection.name);
    // console.log("Collection: ", Business.collection.name);

    const businesses = await Business.find();
    if (businesses.length < 1) {
        res.json("No businesses");
    } else {
        res.json(businesses);
    }

}