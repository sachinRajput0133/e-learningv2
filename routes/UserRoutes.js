import express from "express";
import { addToPlaylist, changePassword, deleteMyProfile, deleteUser, forgetPassword, getAllUsers, getMyProfle, loginUser, logoutUser, registerUser, removeFromPlaylist, resetPassword, updateProfile, updateProfilePicture, updateUserRole } from "../controllers/UserController.js";
import { authorizeAdmin, isAuthenticated } from "../middlewares/auth.js";
import singleUpload from "../middlewares/multer.js";

const router =express.Router()

// Register User
router.route("/register").post( singleUpload,  registerUser)

// Ligin User
router.route("/login").post(loginUser)

// Logout User
router.route("/logout").get(logoutUser)

// Get My Profile
router.route("/me").get(isAuthenticated, getMyProfle)

// Delete My Profile
router.route("/me").delete(isAuthenticated, deleteMyProfile)

// Change Password
router.route("/changepassword").put(isAuthenticated,  changePassword)

// Update profile
router.route("/updateprofile").put(isAuthenticated,  updateProfile)

// Update profile Pictture
router.route("/updateprofilepicture").put(isAuthenticated, singleUpload, updateProfilePicture)

// Forget Password
router.route("/forgetpassword").post( forgetPassword)

// Reset Password
router.route("/resetpassword/:token").put( resetPassword)

// add course to plalise
router.route("/addtoplaylist").post( isAuthenticated,addToPlaylist)

// remove course from playlist
router.route("/removefromplaylist").delete( isAuthenticated,removeFromPlaylist)

// Admin Routes
// get All uses
router.route("/admin/users").get( isAuthenticated ,authorizeAdmin ,getAllUsers)

// Update user role ,Delete user
router.route("/admin/user/:id").get( isAuthenticated ,authorizeAdmin ,updateUserRole).delete(isAuthenticated ,authorizeAdmin ,deleteUser)

// for subscription resgister on raserpay



export default router