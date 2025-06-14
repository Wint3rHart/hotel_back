let mongoose=require('mongoose');
mongoose.connect("mongodb+srv://hassan:mrhassan125@cluster0.is3nlcm.mongodb.net/Hotels?retryWrites=true&w=majority&appName=Cluster0").then(()=>{console.log("MONGODB connected")
}).catch((err)=>{console.log(err);
});
let hash=require('bcryptjs')

let room_schema = new mongoose.Schema({
    hotelName: String,
    location: String,
    rating: String,
  //  urls:{url:String,blur:String},
   rooms:[{no:Number,facilities:[String],perNight:Number,availability:Boolean,rooms:Number,category:String,
    costumers: [{ id:{type: mongoose.Schema.Types.ObjectId, ref: "users" },bookedOn:{type:Date,default:Date.now},booking_id:{type:mongoose.Schema.Types.ObjectId}}] }],
   pics:[],detPics:[{url:String,blur: { 
    type: String, 
    required: true,
    minlength: 6, // Blurhash strings must be at least 6 characters long
  }}],
  reviews:[{rating:Number,comment:String,user:{type:mongoose.Schema.Types.ObjectId,ref:"users"}}]


});

let book_schema=new mongoose.Schema({suite:String,occupant:{type:mongoose.Schema.Types.ObjectId,ref:"users"},hotel:{type:mongoose.Schema.Types.ObjectId,ref:"rooms"}});


let user_schema=new mongoose.Schema({name:String,email:String,password:String,bookings:[{hotel:{type:mongoose.Schema.Types.ObjectId,ref:"rooms"},rooms:Number,check_in:String,check_out:String,special_request:String,hotel_name:String,suite:String,booking_id:{type:mongoose.Schema.Types.ObjectId,}}],profilePic:String,token:String,reviews:[{comment:String,hotel:{type:mongoose.Schema.Types.ObjectId,ref:'users'},rating:Number}]} );

user_schema.pre('save',async function(next){ 

if( this.isModified('password')){
 this.password=await  hash.hash(this.password,10);
 }
 
 next()



  })

let rooms_model=mongoose.model('rooms',room_schema,'rooms');
let user_model=mongoose.model('users',user_schema,'users');
let book_model=mongoose.model('book',book_schema,'book_id');

module.exports={mongoose,rooms_model,user_model,book_model}