let express =require('express');
let app=express();
let {rooms_model,user_model,book_model}=require('./mongo')
let cors=require('cors');
let buffer_mw=require('./multer');
let {ObjectId}=require('mongodb');
let jwt=require('jsonwebtoken');
let hash=require('bcryptjs')
let key='xyz125abc'
app.use(express.static('pics'))
app.use(cors({origin:'http://localhost:5173',credentials:true}));
app.use(express.json());
let NewCache=require('node-cache');
let cache=new NewCache({checkperiod:120})
let cloud=require('./Cloud');
const { default: mongoose } = require('mongoose');
let path=require('path');
dir=path.join(__dirname,"video")
// let middleware=multer({storage:multer.diskStorage({destination:(req,file,cb)=>{ cb(null,'./uploads')   },filename:(req,file,cb)=>{cb(null,`${Date.now()}-${file.originalname}`) }})})
const fs = require('fs');
const cookieParser = require('cookie-parser');
app.use(cookieParser())
let router=express.Router();


app.post('/aik',buffer_mw.single('file'),async(req,res)=>{  console.log(req.file);
  })



app.get('/vid',(req,res)=>{

  let range=req.headers.range;
  let file=fs.statSync(`${dir}/InShot_20210514_233600895.mp4`);
  console.log(file);
  
  let size=file.size;
if(!range){

range=`Bytes=0-${Math.min(1024*1024,size-1)}`


}



let arr=range.replace(/bytes=/,"").split("-")
console.log(arr);


let start=parseInt(arr[0],10);
let end=parseInt(arr[1]?arr[1]:file.size-1,10);

let stream=fs.createReadStream(`${dir}/InShot_20210514_233600895.mp4`,{start,end});
res.writeHead(206,{"content-range":`bytes ${start}-${end}/${file.size}`,'content-length':`${(end-start)+1}`,'content-type':"video/mp4","accept-ranges":"bytes"});

stream.pipe(res)
})

// app.post('/uploads',buffer_mw.single('dp'),async(req,res)=>{ console.log(req.file,req.body);
//   let put=await cloud(req.file.path,req.body.folder);console.log(put); await rooms_model.updateOne({hotelName:req.body.name},{$set:{
//     imageUrl:put.secure_url}})
  
//   })






let generate_access=(data)=>{return  jwt.sign(data,key,{expiresIn:'15min'})  }

let generate_refresh=(data)=>{ return jwt.sign(data,key,{expiresIn:'1d'})  }

router.use( (req,res,next)=>{ if (req.cookies.accessToken) {

try {
  let check=jwt.verify(req.cookies.accessToken,key);
req.user=check;
next();
  
} catch (err) {
  console.log(err.name,"router");
  err.name=="TokenExpiredError"? res.status(401).send({msg:"Expired"}):err.name=="JsonWebTokenError"?res.status(402).json({msg:"Invalid token"}):res.status(403).json({msg:"Authentication Failed"})
  
}
} 
else{res.status(404).json({msg:"Forbiden"})}


}  )

const refresh_mw=async (req,res,next)=>{


if (req.cookies.refreshToken) {
 try {

let check=  jwt.verify(req.cookies.refreshToken,key);


let find=await user_model.findOne({name:check.name,email:check.email});
!find?res.status(399).send({msg:"User Not Valid,Login Again"}):find.token!=req.cookies.refreshToken&&res.status(398).send({msg:"Refresh token didnt match,Login again"});

req.user={_id:find._id,name:find.name,email:find.email,profile:find.profilePic};
next()



 } catch (err) {
  err.name=="TokenExpireError"?res.status(401).send({msg:"Login Again"}):res.status(405).send({msg:err.message});
 }
}else{  res.status(404).send({msg:"Refresh Token Not Found"})}

};

app.post("/refresh",refresh_mw,(req,res)=>{console.log('refresh req recieved');

let accessToken=jwt.sign({name:req.user.name,email:req.user.email,password:req.user.password},key,{expiresIn:'5min'});
res.cookie("accessToken",accessToken,{httpOnly:true,sameSite:'strict',secure:true});
res.status(200).send({msg:"New Access Token made",dets:req.user});


})

app.get('/reviews/:id',async(req,res)=>{ 

  let find=await rooms_model.findOne({_id:new ObjectId(req.params.id)},{reviews:1}).populate({path:"reviews.user"})  ;console.log(find);
  ;res.status(200).send(find)


});


app.post('/upload',buffer_mw.array('files',3),async(req,res)=>{ 
;console.log(req.files);

let urls= await cloud(req.files);


let sec_urls=urls.map((x,i)=>{console.log(req.files[i].path) ;fs.unlinkSync(`${req.files[i].path}`) ;return x.secure_url });


let x=await rooms_model.updateOne({hotelName:'Desert Oasis'},{$set:{pics:sec_urls}})
console.log(x);




 })



app.get('/',(req,res,next)=>{  if(req.query.type!='custom') {
 
  console.log('aaa');
  
let from=cache.get(req.query.type);
from&&console.log('sending from cache');

from!=null?res.status(200).send(from):next()

  }  
else{next()}

},async(req,res)=>{

console.log('sending fresh');


if(req.query.type=="All"){console.log('recieved');let get=await rooms_model.find();
// console.log(get);


cache.set("All",get);
;res.status(200).send(get) }

else if(req.query.type=='custom'){ 
;const regex = new RegExp(`${req.query.search}`, "i");
 let get=await rooms_model.find({hotelName:regex});console.log(get);
 ;res.status(200).send(get); }

else { let get=await rooms_model.find({rating:req.query.type});
cache.set(req.query.type,get)

res.status(200).send(get)}

});

app.get('/book_menu/:id',async(req,res)=>{console.log('rec');
;let get=await rooms_model.findById(req.params.id);res.status(200).send(get)  })

app.post('/register',buffer_mw.single('file'),async(req,res)=>{


console.log(req.body,req.file);
let check=await  user_model.findOne({name:req.body.name,email:req.body.email});
if (!check) {
  await user_model.create({name:req.body.name,email:req.body.email,password:req.body.password,profilePic:req.file.buffer.toString('base64'),token:null});
    res.status(200).send({msg:'User Registered'});
  
    
    

}
else{res.status(500).json('user or email already exists')}

// await user_model.create({name:req.body.name,email:req.body.email,password:req.body.password,bookings:[]})

   
   
    
})
app.post('/sign',async(req,res)=>{ console.log('sign req recieved',req.body);



  try {
    let get = await user_model.findOne({ name: req.body.name });

    if (!get) {
        return res.status(404).json({ msg: "No such user found" });
    }

    if (get.email !== req.body.email) {
        return res.status(400).json({ msg: "Invalid email" });
    }

    const isPasswordValid = await hash.compare(req.body.password, get.password);
    if (!isPasswordValid) {
        return res.status(400).json({ msg: "Invalid password" });
    };

   let refresh_token=generate_refresh(req.body);
    res.cookie("accessToken", generate_access(req.body), {
        httpOnly: true,
        secure: true,
        sameSite: "strict",maxAge:60*60*1000
    });

    res.cookie("refreshToken", refresh_token, {
        httpOnly: true,
        secure: true,
        sameSite: "strict",maxAge:24*60*60*1000
    });
    await user_model.updateOne({_id:get._id},{$set:{token:refresh_token}})

    return res.status(200).json({
        msg: "Signed Successfully",
        dets: { _id: get._id, name: get.name, profile: get.profilePic },
    });

} catch (error) {
    console.error(error);
    return res.status(500).json({ msg: "Server error", error: error.message });
}





}
)


app.post('/booking',async(req,res)=>{ 

console.log(req.cookies);


    let number=parseInt(req.body.number);
    let booking_id=new mongoose.Types.ObjectId;
await user_model.updateOne({_id:req.body.user_id},[{$set:{bookings:{$concatArrays:["$bookings",[{hotel_name:req.body.hotel_name,rooms:req.body.number,check_in:req.body.check_in,check_out:req.body.check_out,special_request:req.body.requests,hotel:new mongoose.Types.ObjectId (req.body.hotel_id),suite:req.body.type,booking_id:booking_id}]]}}}])

await book_model.create({suite:req.body.type,occupant:new ObjectId(req.body.user_id),hotel:new mongoose.Types.ObjectId (req.body.hotel_id)})

await rooms_model.updateOne({_id:req.body.hotel_id},[{$set:{rooms:{$map:{input:"$rooms",as:"x",in:{$cond:{if:{$eq:["$$x.category",req.body.type]},then:{no:"$$x.no",category:"$$x.category",facilities:"$$x.facilities",perNight:"$$x.perNight",costumers:{$concatArrays:["$$x.costumers",[{id:new ObjectId(req.body.user_id),booking_id:booking_id,bookedOn:Date.now()}]]},rooms:{$subtract:["$$x.rooms",number]},availability:{$cond:{if:{$eq:[{$subtract:["$$x.rooms",number]},0]},then:false,else:true }}},else:"$$x" }  }}}}}]);

res.send({msg:'done'})
// new ObjectId(req.body.user_id)
  })

  app.delete('/delete/:id/:hotel/:booking',async(req,res)=>{  console.log(req.params);

    // await user_model.updateOne({_id:req.params.id},[{$set:{bookings:{$filter:{input:"$bookings",as:"x",cond:{$ne:["$$x.hotel",] }   }}}}])
    
await user_model.updateOne({_id:req.params.id},{$pull:{bookings:{booking_id:new ObjectId(req.params.booking)}}})
       
    console.log('step 1 done');
    

// await rooms_model.updateOne({_id:req.params.hotel},{$pull:{"rooms.$[x].costumers":{booking_id:new ObjectId(req.params.booking)}}},{arrayFilters:[{"x.room_id":room_id}]})



         await rooms_model.updateOne({_id:new ObjectId(req.params.hotel)},[{$set:{rooms:{$map:{input:"$rooms",as:"x",in:{$cond:{if:{$ne:["$$x.category",req.query.suite]},then:"$$x",else:{no:"$$x.no",category:"$$x.category",facilities:"$$x.facilities",perNight:"$$x.perNight",rooms:{$add:["$$x.rooms",parseInt(req.query.rooms)]},availability:true,costumers:{$filter:{input:"$$x.costumers",as:"y",cond:{$ne:["$$y.booking_id",new ObjectId(req.params.booking)] }  }} }}    }}}}}]);console.log('step 2 done');
         res.status(200).send({msg:'done'})
                });


app.get('/details',(req,res,next)=>{ let from_cache=cache.get(req.query.id);
  if (from_cache!=null) {


res.status(200).send(from_cache);
    
} else{next()}  } ,async (req, res) => {
   let get=await rooms_model.find({_id:req.query.id});
  
   
   cache.set(req.query.id,get);
   res.status(200).send(get);

});


router.get('/user_panel/:id',async(req,res)=>{ 
  try {
  let get =await user_model.findById(req.params.id,{profilePic:0,password:0,token:0}).populate({path:"bookings.hotel"});

  res.status(200).send(get);

} catch (error) {
  
}  })


app.put('/signOut',async(req,res)=>{ console.log('signout recieved');
;res.clearCookie("accessToken");res.clearCookie("refreshToken");res.status(200).send({msg:'Logged Out'})
});

app.put('/review',async(req,res)=>{ console.log(req.body);
  ;try {
    let get=await rooms_model.updateOne({_id:new ObjectId(req.body.hotel)},{$push:{reviews:{comment:req.body.comment,user:req.body.user,rating:req.body.stars}}});let get2=await user_model.updateOne({_id:new ObjectId(req.body.user)},{$push:{reviews:{hotel:req.body.hotel,comment:req.body.comment,rating:req.body.stars}}}); 
    console.log(get,get2);
    
    res.status(200).send({msg:"Reviews Submitted"})
  } catch (error) {
    res.status(400).send({error:error.message})
  } 
    })



app.use(router)

app.listen(4700,()=>{console.log('started');
})