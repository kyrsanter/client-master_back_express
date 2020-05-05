const  path = require( "path" );
const  fs = require( "fs" );
const  Jimp = require( 'jimp' );
const  modifyExif = require( 'modify-exif' );

const imageCorrector = async (req, res, next) => {
    let {file} = req;
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
                console.log(imageOrientation, 26)
                if (imageOrientation === 1) {
                    imageOrientation = false;
                } else {
                    data["0th"]["274"] = 1; // reset EXIF orientation value
                }
            }
        });
    
        if (imageOrientation) {
            console.log(imageOrientation, 35)
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
                    .quality(50)
                    .write(path.join(__dirname, "../images") + '/' + image.filename); // save
            });
            req.file = image;
        }
    };
    await correctOrientation(file);
    console.log('rotate')
    next()
}

module.exports = imageCorrector;
