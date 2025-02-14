const mongoose = require("mongoose");

const pgSchema = new mongoose.Schema({
    Oname: {
        type: String,
        // unique: true,
    },
    Oph: {
        type: String,
        // unique: true,
    },
    Oemail: {
        type: String,
        // unique: true,
    },
    Oadd: {
        type: String, // No unique constraint here
    },
    pgName: {
        type: String,
        // required: true,
        // unique: true,
    },
    features: [{
        type: String,
    }],
    facilities: [{
        type: String,
    }],
    suitablity: [{
        type: String,
    }],
    rental: {
        type: Number,
    },
    address: {
        type: String,
    },
    discription: [{
        type: String,
    }], 
    pic1: {
        type: String,
    },pic2: {
        type: String,
    },pic3: {
        type: String,
    },
});

const uploadm = new mongoose.model("uploadm", pgSchema);
module.exports = uploadm;
