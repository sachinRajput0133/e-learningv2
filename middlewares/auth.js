import ErrorHandler from "../utils/errorHandler.js";
import { catchAsyncError } from "./catchAsyncError.js";
import jwt from "jsonwebtoken"
import { User } from "../models/User.js";


export const isAuthenticated = catchAsyncError(async(req, res, next)=>{
  const { token } = req.cookies;
  if (!token)
    return next(new ErrorHandler("Not Logged In", 401));

  const decodedData = jwt.verify(token, process.env.JWT_SECRET);
  req.user = await User.findById(decodedData._id);
       next();
});

export const authorizeAdmin = (req, res, next)=>{
  if(req.user.role !== "admin") return next(new ErrorHandler(`${req.user.role} is not allowed to access this resource`,403))

   next()
 
};

// authiorize subscribers 

export const authorizeSubscribers = (req, res, next)=>{
  if(req.user.subscription.status !== "active" && req.user.role !=="admin"   ) return next(new ErrorHandler(`Only subscribers can access this resource`,403))

   next()
 
};

