let cloud=require('cloudinary').v2;

cloud.config({cloud_name:'dfibwqcmx',api_key:537772646948454,api_secret:'V2kci-CL6SHsVogWgZX0GWwI4MI'});

const cloud_fnx=async (x)=>{ try{ let upload=await cloud.uploader.upload(x); if (upload) {
    return upload
}else{return null} } catch(err){ return err.message }   }


module.exports=cloud_fnx