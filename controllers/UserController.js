import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import { User } from "../models/User.js";
import ErrorHandler from "../utils/errorHandler.js";
import { sendEmail } from "../utils/sendEmail.js";
import { sendToken } from "../utils/sendToken.js";
import crypto from "crypto";
import { Course } from "../models/Course.js";
import getDataUri from "../utils/dataUri.js";
import cloudinary from "cloudinary";
import { Stats } from "../models/Stats.js";
export const registerUser = catchAsyncError(async (req, res, next) => {
  const { name, email, password } = req.body;
  const file = req.file;
  
  // const file=req.file
  if (!name || !email || !password || !file)
    return next(new ErrorHandler("Please Fill All Fields"));

  let user = await User.findOne({ email });

  if (user) return next(new ErrorHandler("User Already Exist", 409));
  //409 req can't proceed to conflict
  const fileUri = getDataUri(file);
  // upload file on cloudinary
  const myCloud = await cloudinary.v2.uploader.upload(fileUri.content);
  user = await User.create({
    name,
    email,
    password,
    avatar: {
      public_id: myCloud.public_id,
      url: myCloud.secure_url,
    },
  });

  sendToken(res, user, "Registered Successfully", 201);
});

// login
export const loginUser = catchAsyncError(async (req, res, next) => {
  const { email, password } = req.body;

  // const file=req.file
  if (!email || !password)
    return next(new ErrorHandler("Please Fill All Fields", 400));

  const user = await User.findOne({ email }).select("+password");

  if (!user) return next(new ErrorHandler("User Doesn't Exist", 409));

  console.log("hello");
  const isPasswordMatch = await user.ComparePassword(password);
  if (!isPasswordMatch)
    return next(new ErrorHandler("Invalid Email or Password", 409));

  sendToken(res, user, `Welcome back, ${user.name}`, 200);
});

// Logout
export const logoutUser = catchAsyncError(async (req, res, next) => {
  const Options={
    expires:new Date(Date.now()),
    httpOnly:true,
    secure:true,
    sameSite:true   //none lex
}
  res
    .status(200)
    .cookie("token", null,Options)
    .json({ success: true, message: "Logged Out Successfully" });
});

// Get my profile
export const getMyProfle = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.user._id);

  res.status(200).json({ success: true, user });
});

// Change Password
export const changePassword = catchAsyncError(async (req, res, next) => {
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword)
    return next(new ErrorHandler("Please Fill All Fields", 400));
  const user = await User.findById(req.user._id).select("+password");

  const isPasswordMached = await user.ComparePassword(oldPassword);
  if (!isPasswordMached)
    return next(new ErrorHandler("Incorrect Old Password", 400));

  user.password = newPassword;

  await user.save();

  res
    .status(200)
    .json({ success: true, message: "Password changed Successfully" });
});

// Update profile
export const updateProfile = catchAsyncError(async (req, res, next) => {
  const { name, email } = req.body;

  const user = await User.findByIdAndUpdate(req.user._id);
  
  

  if (name) user.name = name;
  if (email) user.email = email;
  await user.save();

  res
    .status(200)
    .json({ success: true, message: "Profile Updated Successfully" });
});
// Update profile Picture
export const updateProfilePicture = catchAsyncError(async (req, res, next) => {
  // cloudinary to do
  const user=await User.findById(req.user._id)
     const file=req.file   
     
          const fileUri=getDataUri(file)
     await cloudinary.v2.uploader.destroy(user.avatar.public_id)

   const myCloud=  await cloudinary.v2.uploader.upload(fileUri.content)
 
    user.avatar={
      public_id:myCloud.public_id,
      url:myCloud.secure_url
    }
await user.save()

  res
    .status(200)
    .json({ success: true, message: "Profile Picture Updated Successfully" });
});
// Forget password  // needd to make middleware nodemailer
export const forgetPassword = catchAsyncError(async (req, res, next) => {
  const { email } = req.body;
  if (!email) next(new ErrorHandler("Please Enter Your Email", 400));
  const user = await User.findOne({ email });
  if (!user)
    return next(new ErrorHandler("No User With This Email Address", 400));

  const resetToken = await user.getResetToken();

  await user.save();
  //  http://localhost:3000/resetpassword/weolijwejdiopqwejmdp

  const url = `${process.env.FRONTEND_URL}/resetpassword/${resetToken}`;
  const message = `Click on the link to reset your passsword.${url}. If you have not requested then please ignore  `;

  // send token via email
  await sendEmail(user.email, "E-Learning Reset Password", message);

  res
    .status(200)
    .json({
      success: true,
      message: `Reset Token Has Been Send To ${user.email}`,
    });
});
// reset password
export const resetPassword = catchAsyncError(async (req, res, next) => {
  const { token } = req.params;

  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: {
      $gt: Date.now(),
    },
  });

  if (!user)
    return next(new ErrorHandler("Token is invalid or has been expired", 401));
  const { password } = req.body;
  if (!password)
    return next(new ErrorHandler("Please enter new password", 401));
  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();

  res.status(200).json({
    success: true,
    message: "Password Changed Successfully",
  });
});

// Addtoplaylist
export const addToPlaylist = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.user._id);
  const course = await Course.findById(req.body.id);
  if (!course) return next(new ErrorHandler("Invalid Course Id", 404));

  const itemExist = user.playlist.find((item) => {
    if (item.course.toString() === course._id.toString()) return true;
  });

  if (itemExist) return next(new ErrorHandler("Item Already Exist", 409));

  user.playlist.push({
    course: course._id,
    poster: course.poster.url,
  });

  await user.save();
  res.status(200).json({
    success: true,
    message: "Added to playlist",
  });
});
// Remove From Playlist
export const removeFromPlaylist = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.user._id);
  const course = await Course.findById(req.query.id);
  if (!course) return next(new ErrorHandler("Invalid Course Id", 404));

  const newPlaylist = user.playlist.filter((item) => {
    if (item.course.toString() !== course._id.toString()) return item;
  });

  user.playlist = newPlaylist;

  await user.save();
  res.status(200).json({
    success: true,
    message: "Removed From playlist",
  });
});



// get All USers --Admin
export const getAllUsers=catchAsyncError(async(req,res,next)=>{
     
     const users=await User.find()

     res.status(200).json({success:true ,users})
    

})
// upadte user role --Admin
export const updateUserRole=catchAsyncError(async(req,res,next)=>{
        

     const user=await User.findById((req.params.id))
     if(!user) return next(new ErrorHandler("User not found",404))

     if(user.role==="user") user.role="admin"
     else user.role="user"
     await user.save()

     res.status(200).json({success:true ,message:"Role Updated"})
    

})
// delete User --Admin
export const deleteUser=catchAsyncError(async(req,res,next)=>{
        

     const user=await User.findById((req.params.id))
     if(!user) return next(new ErrorHandler("User not found",404))
       
       await cloudinary.v2.uploader.destroy(user.avatar.public_id)

        // cancel subscription

      await user.remove()

     res.status(200).cookie.json({success:true ,message:"User Deleted Successfully"})
    

})

// delete my profile all 
export const deleteMyProfile=catchAsyncError(async(req,res,next)=>{
        
     const user=await User.findById(req.user.id)
     await cloudinary.v2.uploader.destroy(user.avatar.public_id)
   await user.remove()

  res.status(200).cookie("token",null,{
    expires:new Date(Date.now())
  }).json({success:true ,message:"Profile Deleted Successfully"})
 

})


User.watch().on("change",async()=>{
  const stats=await Stats.find({}).sort({createdAt:"desc"}).limit(1)
       const activeSubscriptions=await User.find({"subscription.status":"active"})
     
   stats[0].users=await User.countDocuments();
   stats[0].subscriptions=activeSubscriptions.length;
   stats[0].createdAt=new Date(Date.now());
   await stats[0].save();


      


})