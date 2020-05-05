const {Schema, model} = require('mongoose');

const recordSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    phone: {
        type: String,
        required: true,
    },
    dateUnix: {
        type: Number,
        required: true
    }
});

module.exports = model('Record', recordSchema);