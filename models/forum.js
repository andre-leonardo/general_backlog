const {mongoose} = require('../db')
var passportLocalMongoose = require("passport-local-mongoose")

const userSchema = new mongoose.Schema({
    game: [
        {
            name: {
                type: String,
                required: true,
            },
            text: String,
            img: String
        }
    ],
    movie: [
        {
            name: {
                type: String,
                required: true,
            },
            text: String,
            img: String
        }
    ],
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
})
userSchema.plugin(passportLocalMongoose)

const User = mongoose.model("User", userSchema)

module.exports = User