const AWS = require('aws-sdk');
const s3 = new AWS.S3();

const uploadImage = async(req, res, next) => {
    if (req.body.image) {
        const image = {...req.body.image };
        delete req.body.image;
        const mime = `image/${image.filename.split('.')[1]}`;
        const allowedMimes = ['image/png', 'image/jpg', 'image/jpeg'];
        const buffer = Buffer.from(image.content, 'base64');
        const acl = 'public-read';
        try {
            if (allowedMimes.includes(mime)) {
                const result = await s3.upload({
                    Bucket: process.env.S3_BUCKET,
                    Body: buffer,
                    Key: `${image.path}/${image.filename}`,
                    ACL: acl,
                    ContentType: mime
                }).promise();
                if (result.Location) {
                    if (image.path == 'avatars') {
                        req.body.avatar = result.Location;
                    }
                }
            } else {
                return res.status(400).json({
                    message: 'Bad Request. Images are only allowed...'
                });
            }

        } catch (error) {
            return res.status(500).json({
                message: 'S3 Error...',
                debugInfo: error.message
            });
        }
    }
    next();
}

module.exports = uploadImage;