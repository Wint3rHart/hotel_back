let multer=require('multer');

let upload=multer.diskStorage({destination:(req,file,cb)=>{cb(null,'./uploads')},filename:(req,file,cb)=>{cb(null, `${Date.now()}-${file.originalname}`)}});

let buffer_mw=multer({storage:upload})
// let buffer_mw=multer({storage:multer.diskStorage((req,file,cb)=>{ cb('./uploads')   },(req,file,cb)=>{ cb( new Date.now-file.orignalName) })});


module.exports=buffer_mw