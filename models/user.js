const {mongoose} = require('../db')
var passportLocalMongoose = require("passport-local-mongoose")

const userSchema = new mongoose.Schema({
    username: String,
    password: String,
})
userSchema.plugin(passportLocalMongoose)

const User = mongoose.model("User", userSchema)

module.exports = User