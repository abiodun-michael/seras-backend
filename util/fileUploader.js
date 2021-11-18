const cloudinary = require('cloudinary').v2


cloudinary.config({ 
    cloud_name: 'codevolution-nigeria', 
    api_key: '137386517133568', 
    api_secret: 'QIpac7yylopXi4O8U-FrrFePgrw',
    secure: true
  });


  const uploadImage = async(stream,filename)=>{
      let file = null
   const cloudinaryStream = cloudinary.uploader.upload_stream({ resource_type: "image" }, (error,result)=>{
        if(result){
            file = {secure_url:result?.secure_url,public_id:result?.public_id}
        }
    })

    stream.pipe(cloudinaryStream)
    return file
  }


  module.exports= {uploadImage}