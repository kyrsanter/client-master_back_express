const {model, Schema} = require('mongoose');

let ServiceSchema = new Schema({
    title: {
        type: String
    }
})

module.exports = model('Service', ServiceSchema)