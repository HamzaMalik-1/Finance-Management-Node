const cloudinary = require('cloudinary').v2;
const configuration=require('./config')
const {cloudinaryCloudName,cloudinaryApiKey,cloudinaryApiSecret}=configuration

cloudinary.config({
  cloud_name: cloudinaryCloudName,
  api_key:    cloudinaryApiKey,
  api_secret: cloudinaryApiSecret,
});

module.exports = cloudinary;
