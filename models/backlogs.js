const {mongoose} = require('../db')

const backlogSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    cover: {
        type: String
    },
    nonLinkCover: {
        
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
    type: {
        type: String
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
})

const Backlog = mongoose.model("Backlog", backlogSchema)

module.exports = Backlog