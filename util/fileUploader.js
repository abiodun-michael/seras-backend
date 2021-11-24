const cloudinary = require('cloudinary').v2


cloudinary.config({ 
    cloud_name: 'codevolution-nigeria', 
    api_key: '137386517133568', 
    api_secret: 'QIpac7yylopXi4O8U-FrrFePgrw',
    secure: true
  });


  const uploadImage =(stream,folder)=>{
      
    return new Promise((resolve, reject)=>{
        let cloudinaryStream = cloudinary.uploader.upload_stream({folder, resource_type: "image" }, 
            (error,result)=>{
            if(result){
                resolve(result)
                return
            }else{
                reject(error)
            }
        }) 
        stream.pipe(cloudinaryStream)
    })

  }
  module.exports= {uploadImage}