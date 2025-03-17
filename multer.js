let multer=require('multer');


// let multer_mw=multer({storage:multer.memoryStorage()});

let multer_mw=multer({storage:multer.diskStorage({destination:(req,file,cb)=>{cb(null,'./uploads')},filename:(req,file,cb)=>{cb(null,`${Date.now()}-${file.originalname}`)}})})

module.exports=multer_mw