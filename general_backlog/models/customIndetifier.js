const {mongoose} = require('../db')

const customSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
})

const Customlog = mongoose.model("Customlog", customSchema)

module.exports = Customlog