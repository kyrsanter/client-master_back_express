const multer = require('multer');

let storage = multer.diskStorage({

    destination(req, file, cb) {
        cb(null, './images/')
    },

    filename(req, file, cb) {
        let date = Date.now();
        cb(null, date + file.originalname);
    }

});

let mimes = ['image/png', 'image/jpg', 'image/jpeg'];

let fileFilter = (req, file, cb) => {
    if (mimes.includes(file.mimetype)) {
        cb(null, true)
    }
    else {
        cb(null, false)
    }
}


module.exports = multer({ storage, fileFilter })