const {mongoose} = require('../db')
var passportLocalMongoose = require("passport-local-mongoose")

const userSchema = new mongoose.Schema({
    username: String,
    password: String,
    bio: String,
    avatar: String,
    backlogs: [
        {
            name: {
                type: String,
                required: true
            },
            cover: {
                type: String
            },
            description: {
                type: String
            },
            finishStatus: {
                type: Number
            },
            released: {
                type: String
            },
            score: {
                type: String
            },
            type: {
                type: String
            }
        }
    ],
    customlogs: [
        {
            name: {
                type: String,
                required: true,
            }
        }
    ]
})
userSchema.plugin(passportLocalMongoose)

const User = mongoose.model("User", userSchema)

module.exports = User