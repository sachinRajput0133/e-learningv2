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
// app.use(
//   cors({
  
//     origin:[process.env.FRONTEND_URL],
   
//     credentials: true, //OTHERWISE WON'T BE ABLE TO USE COOKIE
//     methods: ["GET", "POST", "PUT", "DELETE"],
//   })
// );
const whitelist = [process.env.FRONTEND_URL,'https://api.razorpay.com','https://checkout-static.razorpay.com/build/c15c2810f99ef3fd51cbbe1a20598e286eff50c1/checkout-frame.js']
const corsOptionsDelegate = function (req, callback) {
  let corsOptions;
  if (whitelist.indexOf(req.header('Origin')) !== -1) {
    corsOptions = { origin: true , credentials: true, methods: ["GET", "POST", "PUT", "DELETE"],} // reflect (enable) the requested origin in the CORS response
  } else {
    corsOptions = { origin: false } // disable CORS for this request
  }
  callback(null, corsOptions) // callback expects two parameters: error and options
}
 
app.get('/products/:id', cors(corsOptionsDelegate), function (req, res, next) {
  res.json({msg: 'This is CORS-enabled for a whitelisted domain.'})
})
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
