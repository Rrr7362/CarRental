import express from "express";
import { protect } from "../middleware/auth.js";
import { addCar, changeRoleToOwner, deleteCar, toggleCarAvailability, getOwnerCars, getDashboardData, updateUserImage } from "../controllers/ownerController.js";
import upload from "../middleware/multer.js";
import { authorize } from "../middleware/authorize.js";


const ownerRouter = express.Router();

ownerRouter.post("/admin/change-role", protect, authorize("admin"), changeRoleToOwner)
ownerRouter.post("/add-car", upload.single("image"), protect, addCar)
ownerRouter.get("/cars", protect, getOwnerCars)
ownerRouter.post("/toggle-car", protect, toggleCarAvailability)
ownerRouter.post("/delete-car", protect, deleteCar)

ownerRouter.get('/dashboard', protect, getDashboardData)
ownerRouter.post("/update-image", upload.single("image"), protect, updateUserImage)

export default ownerRouter;



