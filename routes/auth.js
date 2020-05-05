const {Router} = require('express');
const bcrypt = require('bcrypt');
const validateUserPass = require('../middleware/validate');
const jwt = require('jsonwebtoken');
const config = require('../config/default.json'); 
const authCheck = require('../middleware/auth-check-md');
const {check, validationResult} = require('express-validator');
const User = require('../models/user');

const router = new Router;

router.get('/init', authCheck, async (req, res) => {
    let id = req.userId;
    try {
        let candidate = await User.findById(id).select('_id');
        if (!candidate) {
            return res.status(401);
        }
        res.status(200).json(candidate)
    } catch(err) {  
        res.status(401)
    }
    

})

router.post('/auth/registration', [
    check('name').trim().isLength({min: 3}).withMessage('Имя не может быть пустым или длинной меньше 3-х символов'),
    check('phone').matches(/^(?:\+38)?0[36957]{1}[3671248]{1}[0-9]{7}$/).withMessage('Номер телефона должен начинаться на +380 или на 0'),
    check('pass').trim().isLength({min:3}).withMessage('Пароль не может быть пустым или длинной меньше 3-х символов'),
], async (req, res) => {
    const errors = validationResult(req);
    if (req.body.pass !== req.body.rpass) {
        let newError = {
            msg: 'Пароли не совпадают'
        }
        errors.errors.push(newError);
    }
    if (!req.body.client && !req.body.master) {
        errors.errors.push({msg: 'Выберите "Клиент" или "Мастер"'})
    }
    if (!errors.isEmpty()) {
        return res.json(errors.errors)
    }
    try {
        let messages = [];
        let {name, phone, pass, rpass, client, master} = req.body;
        let candidate = await User.findOne({ phone });
        if (!candidate) {
            let cryptedPass = bcrypt.hashSync(pass, 10);
            const user = new User({
                name, 
                phone, 
                pass: cryptedPass,
                roles: {
                    client,
                    master
                }
            });
            user.save();
            messages.push({msg: "Пользователь создан!"})
            return res.status(201).json(messages)
        }
        else {
            messages.push({msg: "Пользователь уже существует!"})
            res.status(400).json(messages)
        }
    }
    catch (e) {
        messages.push({msg: "Что-то пошло не так!"})
        return res.status(500).json(messages)
    }
});

router.post('/auth/login', async (req, res) => {
    let {phone, pass} = req.body;
    let messages = [];
    let candidate = await User.findOne({phone});
    if (!candidate) {
        messages.push({msg: "Не верный логин или пароль"})
        return res.status(401).json(messages)
    }
    bcrypt.compare(pass, candidate.pass, (err, result) => {
        if (!result) {
            messages.push({msg: "Не верный логин или пароль"})
            return res.status(401).json(messages)
        }
        let token = jwt.sign(
            {userId: candidate._id},
            config.jwtSecret,
            {expiresIn: '10d'}
        )
        let {pass, ...candidateData} = candidate;
        res.json({
            token, 
            user: candidateData._doc,
            messages: [{msg: 'Добро пожаловать'}]
        })
    })
})

router.get('/profile/:id', authCheck, async (req, res) => {
    let {id} = req.params;
    try {
        let candidate = await User.findById(id);
        if (!candidate) {
            return res.status(404);
        }
        let {_doc: {pass, ...user}} = candidate;
        let data;
        if (id === req.userId) {
            data = {...user, admin: true}
            return res.send(data);
        }
        data = {...user};
        return res.send(data); 
    }
    catch(err) {
        return res.json({msg: 'Упс, что то пошло не так!'})
    } 
})

router.get('/people', async (req, res) => {
    //http://localhost:3333/api/people?limit=12345
    //req.query
    let {skip, limit} = req.query;
    let count = await User.find().countDocuments();
    let candidates = await User.find().skip(Number(skip)).limit(Number(limit)).select('-pass');
    if (candidates.length === 0) {
        return res.status(404).json([{ msg: 'По этому запросу пользователей не найдено' }])
    }
    return res.status(200).json({
        people: candidates,
        count,
    })
})



module.exports = router;