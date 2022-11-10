import express from "express";
import { contact ,getDashboardStats,request } from "../controllers/OtherController.js";
import { authorizeAdmin, isAuthenticated } from "../middlewares/auth.js";



const router = express.Router();

// Contact form
router.route("/contact").post(contact)

// Request form
router.route("/courserequest").post(request)

// getDashboardStats
router.route("/admin/stats").get(isAuthenticated,authorizeAdmin,getDashboardStats)

export default router;
