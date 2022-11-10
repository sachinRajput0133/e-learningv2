import mongoose from "mongoose";
import validator from "validator";
import jwt  from "jsonwebtoken";
import bcrypt from "bcryptjs"
import crypto from "crypto"
const userSchema =new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please enter your name"],
  },
  email:{
    type: String,
    required: [true, "Please enter your email"],
    unique:true,
    validate:[validator.isEmail,"Please Emter Valid Email"]
  },
  password:{
    type:String,
    required:true,
    minLength:[6,"Password must be atleast 6 characters"],
    select:false, 
},
role:{
    type:String,
    enum:["admin","user"],
    default:"user",
  },
  subscription:{
    id:String,       //will geth both id and status from razorpay
    status:String
  },
  avatar:{
    public_id:{
        type:String,
        required:true
    },                 
    url:{
        type:String,
        required:true
    }
  },
  playlist:[
    {
        course:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"Course"
        },
        poster:String,
    }
  ],
  createdAt:{
    type:Date,
    default:Date.now()
  },
  resetPasswordToken:String,
  resetPasswordExpire:String,

});


// bcrypt password
userSchema.pre("save",async function(next){
  if(!this.isModified("password")){
        next()
  }

  this.password=await bcrypt.hash(this.password,12)
})

// jwt token
userSchema.methods.getJwtToken = function(){
  return jwt.sign({_id: this._id}, process.env.JWT_SECRET, {
      expiresIn: "15d"
  });
}

// Compare password
userSchema.methods.ComparePassword= async function(enteredPassword){
  return await  bcrypt.compare(enteredPassword,this.password)
}


userSchema.methods.getResetToken = function () {
  const resetToken = crypto.randomBytes(20).toString("hex");

  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.resetPasswordExpire = Date.now() + 15 * 60 * 1000;

  return resetToken;
};







export const User = mongoose.model("User",userSchema);
