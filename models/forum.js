const {mongoose} = require('../db')
var passportLocalMongoose = require("passport-local-mongoose")

const forumSchema = new mongoose.Schema({
    discussion: [
        {
            name: String,
            text: String,
            img: String,
            coverLocal: {
                buffer: Buffer, 
                mimetype: String 
            },
            discussionType: String,
            user: {
                id: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'User'
                }
            },
            answer: [
                {
                    text: String,
                    img: String,
                    coverLocal: {
                        buffer: Buffer, 
                        mimetype: String 
                    },
                    user: {
                        id: {
                            type: mongoose.Schema.Types.ObjectId,
                            ref: 'User'
                        }
                    }
                }
            ]
        }
    ],
})
forumSchema.plugin(passportLocalMongoose)

const Forum = mongoose.model("Forum", forumSchema)

module.exports = Forum