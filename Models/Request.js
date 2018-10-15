var mongo = require("mongoose");
var Schema = mongo.Schema
var ObjectId = Schema.ObjectId


var Request = new Schema(
    {
        requester: String, //Who requested the song?
        context_uri: String, //need to query for track
        title: String, //Song title
        

    }, {timestamps: true}
)

module.exports = mongo.model("Request", Request)