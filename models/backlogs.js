const {mongoose} = require('../db')

const backlogSchema = new mongoose.Schema({
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
    consumed: {
        type: Number
    }
})

const Backlog = mongoose.model("Backlog", backlogSchema)

module.exports = Backlog