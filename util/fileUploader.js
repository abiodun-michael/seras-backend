const cloudinary = require('cloudinary').v2


cloudinary.config({ 
    cloud_name: 'codevolution-nigeria', 
    api_key: '137386517133568', 
    api_secret: 'QIpac7yylopXi4O8U-FrrFePgrw',
    secure: true
  });


  const uploadImage = async(stream,filename)=>{
      
   const cloudinaryStream = cloudinary.uploader.upload_stream({ resource_type: "image" }, (error,result)=>{
        if(result){
            return result
        }
    })

    stream.pipe(cloudinaryStream)

  }


  module.exports= {uploadImage}