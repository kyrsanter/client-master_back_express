const config = require('../config/default.json');
const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => { 
    let messages = [];
    if (req.mothod === 'OPTIONS') {
        return next();
    }
    const token = req.header('authorization').replace('Bearer ', '');
    if (!token) {
        messages.push({msg: 'Вы не авторизованы'})
        return res.status(401).json(messages);
    }
    const secret = config.jwtSecret;
    jwt.verify(token, secret, (err, decoded) => {
        if (err && err.message === 'jwt malformed') {
            next();
            return;
        }
        if (err && err.message === 'jwt expired') {
            messages.push({msg: 'Вы не авторизованы'})
            return res.status(401).json(messages);
        }
        if (!err) {
            req.userId = decoded.userId
            next()
        }
    });
}