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
   
    origin:["*"],
   
    credentials: true, //OTHERWISE WON'T BE ABLE TO USE COOKIE
    methods: ["GET", "POST", "PUT", "DELETE","HEAD"],
  })
);

 

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
