import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import { User } from "../models/User.js";
import { instance } from "../server.js";
import ErrorHandler from "../utils/errorHandler.js";
import crypto from "crypto";
import { Payment } from "../models/Payment.js";

// Buy subscription
export const buySubscription = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  if (user.role === "admin")
    return next(new ErrorHandler("Admin Can't Buy Subscription", 404));

  const plan_id = process.env.PLAN_ID || "plan_KduL3uZitjBNUa";
  const subscription = await instance.subscriptions.create({
    plan_id: plan_id,
    customer_notify: 1,
    total_count: 12,
  });

  user.subscription.id = subscription.id;
  user.subscription.status = subscription.status;
  await user.save();

  res.status(201).json({ success: true, subscriptionId: subscription.id }); //normally will pass id
});

// payment verification
export const paymentVerification = catchAsyncError(async (req, res, next) => {
  const { razorpay_signature, razorpay_payment_id, razorpay_subscription_id } =
    req.body; //will get directly from razorpay
  const user = await User.findById(req.user.id);

  const subscription_Id = user.subscription.id;
  const generated_signature = crypto
    .createHmac("sha256", process.env.RAZORPAY_SECRET_KEY)
    .update(razorpay_payment_id + "|" + subscription_Id, "utf-8")
    .digest("hex");

  const isAuthentic = generated_signature === razorpay_signature;

  if (!isAuthentic)
    return res.redirect(`${process.env.FRONTEND_URL}/paymentfail`);
  // database comes here
  await Payment.create({
    razorpay_signature,
    razorpay_payment_id,
    razorpay_subscription_id,
  });
// use data during+
 refund
  user.subscription.status = "active";
await user.save()
  res.redirect(`${process.env.FRONTEND_URL}/paymentsuccess?reference=${razorpay_payment_id}`)
});

// get razor pay key
export const getRazorpayKey=catchAsyncError(async(req,res,next)=>{
    res.status(200).json({success:true,key:process.env.RAZORPAY_SECRET_KEY})
})
// CancelSubscription
export const cancelSubscription=catchAsyncError(async(req,res,next)=>{
    // refund
    const user=await User.findById(req.user.id)
    const subscriptionId=user.subscription.id
    let refund=false
    instance.subscriptions.cancel(subscriptionId)

// have to find payment from payment model
const payment=await Payment.findOne({
    razorpay_payment_id:subscriptionId
})

const gap=Date.now() - payment.createdAt
const refundTime=process.env.REFUND_DAYS *24*60*60*1000;
if(refundTime > gap){
    // await instance.payments.refund(payment.razorpay_payment_id)
    refund=true
}

await payment.remove()
user.subscription.id=undefined;
user.subscription.status=undefined;
await user.save()

    res.status(200).json({success:true,messge:refund?"Subscription cancelled, You will recieve full refund within 7 days":"Subscription cancelled,No refund initiates as subscription wascancelled after 7 days" })
})