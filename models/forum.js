const {mongoose} = require('../db')
var passportLocalMongoose = require("passport-local-mongoose")

const forumSchema = new mongoose.Schema({
    discussion: [
        {
            name: String,
            text: String,
            img: String,
            discussionType: String,
            user: {
                id: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'User'
                },
                username: String
            },
            answer: [
                {
                    text: String,
                    img: String,
                    user: {
                        id: {
                            type: mongoose.Schema.Types.ObjectId,
                            ref: 'User'
                        },
                        username: String
                    }
                }
            ]
        }
    ],
})
forumSchema.plugin(passportLocalMongoose)

const Forum = mongoose.model("Forum", forumSchema)

module.exports = Forum