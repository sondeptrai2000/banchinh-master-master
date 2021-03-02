var mongoose = require("mongoose");
//const { stringify } = require("querystring");
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb+srv://minhson123:minhson123@cluster0.v0phx.mongodb.net/test";

mongoose.connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

const Schema = mongoose.Schema;
const AccountSchema = new Schema({
    username: String,
    password: String,
    email : String,
    slug: String,
    role : {
        type : String,
        default : "student"
    },
    // fileSummit:[{
    //     type : mongoose.Schema.Types.ObjectId
    // }]   
},
{
    collection: 'account'
});

var AccountModel = mongoose.model('account', AccountSchema);
module.exports = AccountModel