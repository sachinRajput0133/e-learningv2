import multer from "multer"
const storage=multer.memoryStorage();

// advantage is the moment we remove reference of video it will remove file from cloudinary
// alse get access of req.file

const singleUpload=multer({storage}).single("file")   //same name as file=req.file

export default singleUpload