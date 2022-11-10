import express from "express";
import { buySubscription, cancelSubscription, getRazorpayKey, paymentVerification } from "../controllers/PaymentController.js";

import { authorizeAdmin, isAuthenticated } from "../middlewares/auth.js";

const router = express.Router();
// Buy Subscription 
router.route("/subscribe").get(isAuthenticated , buySubscription)


// Payment verification and save reference in database tezt this while on front end
router.route("/paymantverification").post(isAuthenticated , paymentVerification)

// Get Razorpay key
router.route("/razorpaykey").get( getRazorpayKey)

//Cancel subscrption authorize subscriber
router.route("/subscribe/cancel").delete(isAuthenticated,cancelSubscription)




export default router;
