const {Router} = require('express');
const ServiceSchema = require('../models/service');

let router = new Router();

router.get('/services', async (req, res) => {
    try {
        let services = await ServiceSchema.find();
        if (services.length === 0) {
            return res.status(404).json({msg: 'К сожалению произошла ошибка, попробуйте перезагрузить страницу'})
        }
        res.send(services)
    }
    catch(error) {
        return res.status(500).json({msg: 'К сожалению произошла ошибка, попробуйте перезагрузить страницу'})
    }
    
})

module.exports = router;