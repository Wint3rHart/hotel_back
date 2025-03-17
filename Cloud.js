let cloud=require('cloudinary').v2;

cloud.config({cloud_name:"dfibwqcmx",api_key:'537772646948454',api_secret:'V2kci-CL6SHsVogWgZX0GWwI4MI'})


const cloud_fnx=async(path,public,folder)=>{  let upload=await cloud.uploader.upload(path,{folder:`/Hotel-pics/${folder}`,public_id:public});let url=cloud.url(upload.public_id,{height:400,width:500,crop:'fill',gravity:'auto'}); return [upload,url]  }


module.exports=cloud_fnx