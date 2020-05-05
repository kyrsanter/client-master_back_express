const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const routes = require('./routes/record');
const authRoutes = require('./routes/auth');
const filesRoutes = require('./routes/files');
const serviceRoutes = require('./routes/services')
const cors = require('cors');
const bodyParser = require('body-parser');
const config = require('./config/default.json');

const db = config.db;
const port = config.port;

const app = express();


app.use(cors())
app.use(express.static(path.join(__dirname, 'images/')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use('/api', routes);
app.use('/api', authRoutes);
app.use('/api', filesRoutes);
app.use('/api', serviceRoutes);


let start = async () => {
    await mongoose.connect(db, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false
    });
    app.listen(port);
};

start();

