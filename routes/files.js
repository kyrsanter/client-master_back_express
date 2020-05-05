const {Router} = require('express');
const file = require('../middleware/file');
const fs = require('fs');
const imageRotator = require('../middleware/rotate-image');

const  path = require( "path" );
const  Jimp = require( 'jimp' );
const  modifyExif = require( 'modify-exif' );
const User = require('../models/user');

let router = new Router();


router.post('/update-photo/:id', file.single('photo'), async (req, res) => {
    const body = JSON.parse(JSON.stringify(req.body))
    fs.unlink(path.join(__dirname, "../images") + '/' + body.prevPhoto, (err, result) => {

    })
    await correctOrientation(req.file);
    let {id} = req.params;
    await User.findByIdAndUpdate(id, {photo: req.file.filename}, {new: true}, (err, doc) => {
        if (err) {
            console.log(err, 'error update photo')
        }
        else {
            res.json(doc.photo);
        }
    });
})

const readFileAsync = async (file) => {
    return await new Promise((resolve, reject) => {
        fs.readFile(file, async(err, data) => {
            if (err) {
                reject(err)
            } else {
                resolve(data);
            } 
        });
    });
};

const correctOrientation = async (image) => {
    let imageOrientation = false;
    let rotateDeg = 0;
    const buffer = modifyExif(await readFileAsync(path.join(__dirname, "../images") + '/' + image.filename), data => {
        imageOrientation = data && data["0th"] && data["0th"]["274"] ? data["0th"]["274"] : false;
        if (imageOrientation) {
            if (imageOrientation === 1) {
                imageOrientation = false;
            } else {
                data["0th"]["274"] = 1; // reset EXIF orientation value
            }
        }
    });

    if (imageOrientation) {
        switch (imageOrientation) {
            case 3:
                rotateDeg = 180;
                break;
            case 6:
                rotateDeg = 270;
                break;
            case 8:
                rotateDeg = 90;
                break;
            default:
                rotateDeg = 0;
                break;
        }
        Jimp.read(buffer, (err, lenna) => {
            if (err) {
                console.log('err', err);
                return;
            }
            lenna
                .rotate(rotateDeg) // correct orientation
                .quality(20)
                .write(path.join(__dirname, "../images") + '/' + image.filename); // save
        });
    }
};

module.exports = router;