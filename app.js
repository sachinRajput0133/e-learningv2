import express from "express";
import ErrorMiddleware from "./middlewares/Error.js";
import courseRouter from "./routes/CouseRoutes.js";
import userRouter from "./routes/UserRoutes.js";
import paymentRoute from "./routes/PaymentRoutes.js";
import otherRoute from "./routes/OtherRoutes.js";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
dotenv.config({ path: "./config/config.env" });

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  cors({
   
    origin:[process.env.FRONTEND_URL],
   
    credentials: true, //OTHERWISE WON'T BE ABLE TO USE COOKIE
    methods: ["GET", "POST", "PUT", "DELETE","HEAD",'https://api.razorpay.com'],
  })
);
// var allowedOrigins = [process.env.FRONTEND_URL,
//                       'https://api.razorpay.com'];
// app.use(
//   cors({
   
//     origin:function(origin, callback){
//       // allow requests with no origin 
//       // (like mobile apps or curl requests)
//       if(!origin) return callback(null, true);
//       if(allowedOrigins.indexOf(origin) === -1){
//         var msg = 'The CORS policy for this site does not ' +
//                   'allow access from the specified Origin.';
//         return callback(new Error(msg), false);
//       }
//       return callback(null, true);
//     },
   
//     credentials: true, //OTHERWISE WON'T BE ABLE TO USE COOKIE
//     methods: ["GET", "POST", "PUT", "DELETE","HEAD"],
//   })
// );

 

app.use("/api/v1", courseRouter);
app.use("/api/v1", userRouter);
app.use("/api/v1", paymentRoute);
app.use("/api/v1", otherRoute);

export default app;
app.get("/", (req, res) =>
  res.send(
    `<h1>site is working. click <a href=${process.env.FRONTEND_URL}> here   </a> to visit frontend</h1>`
  )
);

app.use(ErrorMiddleware);
