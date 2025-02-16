let express=require('express');
let app=express();
let {rooms_model,user_model}=require('./mongo')
let cors=require('cors');
let buffer_mw=require('./multer')
let {ObjectId}=require('mongodb');


app.use(express.static('pics'))
app.use(cors());
app.use(express.json());
let cloud=require('./Cloud')
// let middleware=multer({storage:multer.diskStorage({destination:(req,file,cb)=>{ cb(null,'./uploads')   },filename:(req,file,cb)=>{cb(null,`${Date.now()}-${file.originalname}`) }})})






app.get('/',async(req,res)=>{

console.log(req.query);

if(req.query.type=="All"){console.log('recieved');let get=await rooms_model.find();

;res.send(get) }
else { let get=await rooms_model.find({rating:req.query.type});res.send(get)}

});

app.get('/book_menu/:id',async(req,res)=>{console.log('rec');
;let get=await rooms_model.findById(req.params.id);res.send(get)  })

app.post('/register',buffer_mw.single('file'),async(req,res)=>{


console.log(req.body,req.file);
let check=await  user_model.findOne({name:req.body.name,email:req.body.email});
if (!check) {
  await user_model.create({name:req.body.name,email:req.body.email,password:req.body.password});
    res.send({msg:'User Registered'});
    let inCloud=await cloud(req.file.path);
    console.log(inCloud);
    
    

}
else{res.status(500).json('user or email already exists')}

// await user_model.create({name:req.body.name,email:req.body.email,password:req.body.password,bookings:[]})

   
   
    
})
app.post('/sign',async(req,res)=>{ console.log('sign req recieved',req.body);

try {
    let get=await user_model.findOne({name:req.body.name},{profilePic:0});  
!get?res.send({msg:'No such user found'}):get.email!==req.body.email?res.send({msg:"invalid email"}):get.password!==req.body.password?res.send({msg:"invalid password"}):res.send({msg:'Signed Successfuly',dets:{_id:get._id,name:get.name}})


} catch (error) {
    res.status(500).send({msg:error})
}  





}
)


app.post('/booking',async(req,res)=>{ 

    let number=parseInt(req.body.number)
await user_model.updateOne({_id:req.body.user_id},[{$set:{bookings:{$concatArrays:["$bookings",[{hotel_name:req.body.hotel_name,rooms:req.body.number,check_in:req.body.check_in,check_out:req.body.check_out,special_request:req.body.requests,hotel:new ObjectId(req.body.movie_id)}]]}}}])


await rooms_model.updateOne({_id:req.body.hotel_id},[{$set:{rooms:{$map:{input:"$rooms",as:"x",in:{$cond:{if:{$eq:["$$x.category",req.body.type]},then:{no:"$$x.no",category:"$$x.category",facilities:"$$x.facilities",perNight:"$$x.perNight",costumers:{$concatArrays:["$$x.costumers",[new ObjectId(req.body.user_id)]]},rooms:{$subtract:["$$x.rooms",number]},availability:{$cond:{if:{$eq:[{$subtract:["$$x.rooms",number]},0]},then:false,else:true }}},else:"$$x" }  }}}}}]);

res.send({msg:'done'})

  })


//NOT THIS ONE

app.get('/details', async (req, res) => {
   let get=await rooms_model.find({_id:req.query.id});res.send(get)

});






app.listen(4700,()=>{console.log('started');
})