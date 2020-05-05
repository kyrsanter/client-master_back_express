const {Router} = require('express');
const router = Router();
const Record = require('../models/record');

router.post('/new-record', (req, res) => {
    let sch = new Record({
        name: req.body.name,
        phone: req.body.phone,
        dateUnix: Date.parse(`${req.body.date}T${req.body.time}`),
    });
    sch.save();
    res.send()
});

router.get('/all-records', async (req, res) => {
    let data = await Record.find();
    res.send(data)
});

module.exports = router;