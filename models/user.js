const {Schema, model} = require('mongoose');

let userSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    phone: {
        type: String,
        required: true
    },
    pass: {
        type: String,
        required: true
    },
    photo: String,
    regDate: {
        type: Number,
        default: Date.now()
    },
    admin: {
        type: Boolean,
        default: false
    },
    roles: {
        client: {
            type: Boolean
        },
        master: {
            type: Boolean
        },
    }
});

module.exports = model('User', userSchema);