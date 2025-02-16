let mongoose=require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/hotel');


let room_schema = new mongoose.Schema({
    hotelName: String,
    location: String,
    rating: String,
    imageUrl: String,
   costumers: [{ type: mongoose.Schema.Types.ObjectId, ref: "users" }],
   kamray:[{no:Number,facilities:[String],perNight:Number,availability:Boolean,rooms:Number,category:String }]
});



let user_schema=new mongoose.Schema({name:String,email:String,password:String,bookings:[{hotel:{type:mongoose.Schema.Types.ObjectId,ref:"Room"},number:Number}],profilePic:String});

user_schema.pre('save',async function(next){  ;console.log(this);
         ;next()
})

let rooms_model=mongoose.model('Room',room_schema,'rooms');
let user_model=mongoose.model('users',user_schema,'users');


module.exports={mongoose,rooms_model,user_model}