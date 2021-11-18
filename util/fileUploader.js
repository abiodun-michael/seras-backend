const cloudinary = require('cloudinary').v2


cloudinary.config({ 
    cloud_name: 'sample', 
    api_key: '874837483274837', 
    api_secret: 'a676b67565c6767a6767d6767f676fe1',
    secure: true
  });


  const uploadImage = async(stream,filename)=>{
   const cloudinaryStream = cloudinary.uploader.upload_stream({ resource_type: "image" }, (error,result)=>{
        console.log(result)
        console.log(error)
    })

    stream.pipe(cloudinaryStream)

  }


  module.exports= {uploadImage}