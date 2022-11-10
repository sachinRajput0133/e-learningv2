import express from "express";
import {
  addLecture,
  createCourse,
  deleteCourse,
  deleteLecture,
  getAllCourses,
  getCourseLectures,
} from "../controllers/CourseController.js";
import { authorizeAdmin, authorizeSubscribers, isAuthenticated } from "../middlewares/auth.js";
import singleUpload from "../middlewares/multer.js";
const router = express.Router();

// Get all courses without lecture
router.route("/courses").get(getAllCourses);

// Create New Course --Admin
router
  .route("/createcourse")
  .post(isAuthenticated, authorizeAdmin, singleUpload, createCourse);

// Add  lectures,Delete Course ,  Get Course Lecture

router
  .route("/course/:id")
  .get(isAuthenticated, authorizeSubscribers , getCourseLectures)
  .post(isAuthenticated, authorizeAdmin, singleUpload, addLecture)
  .delete(isAuthenticated, authorizeAdmin,deleteCourse)


//delete Lectures
router
  .route("/lecture")
  .delete(isAuthenticated, authorizeAdmin,deleteLecture)

export default router;
