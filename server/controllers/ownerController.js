import imageKit from "../configs/imagekit.js";
import Booking from "../models/Booking.js";
import User from "../models/User.js";
import fs from "fs";
import Car from "../models/Car.js";

// Change role
export const changeRoleToOwner = async (req,res)=>{
    try {
        const {_id} = req.user;
        await User.findByIdAndUpdate(_id, {role: "owner"})
        res.json({success: true, message: "Now you can list cars"})
    } catch (error) {
        console.log(error.message);
        res.json({success: false, message: error.message})
    }
}

// API to list Car

export const addCar = async (req,res)=>{
    try {
        const {_id} = req.user;
        let car = JSON.parse(req.body.carData);
        const imageFile = req.file;

        // Upload Image to Imagekit
        const fileBuffer = fs.readFileSync(imageFile.path)
        const response = await imageKit.upload({
            file: fileBuffer,
            fileName: imageFile.originalname,
            folder: '/cars'
        })

        var optmizedImageUrl = imageKit.url({
            path: response.filePath,
            transformation : [
                {width: '1280'}, // Width resizing
                {quality: 'auto'}, // Auto compression
                { format: 'webp'} // Convert to modern format
            ]
        }); 
       
        const image = optmizedImageUrl;
        await Car.create({...car, owner: _id, image})

        res.json({success: true, message: "Car Added"})

        
    } catch (error) {
        console.log(error.message);
        res.json({success: false, message: error.message})
    }
}


// API to list owner cars
export const getOwnerCars = async (req,res)=>{
    try {
        const {_id} = req.user;
        const cars = await Car.find({owner: _id})
        res.json({success: true, cars})
    } catch (error) {
        console.log(error.message);
        res.json({success: false, message: error.message})
    }
}

// API to Toggle Car Availability
export const toggleCarAvailability = async (req,res)=>{
    try {
        const {_id} = req.user;
        const {carId} = req.body
        const car = await Car.findById(carId)

        // Checking is car belongs to the user
        if(car.owner.toString() !== _id.toString()){
            return res.json({ success: false, message: "Unauthorized" });
        }

        car.isAvailable = !car.isAvailable;
        await car.save()

        res.json({success: true, message: "Availability Toggled"})
    } catch (error) {
    //    console.log("ERROR IN:", req.originalUrl)
    //    console.log(error.message)
       res.json({success: false, message: error.message})
    }
}


// Api to delete Car
export const deleteCar = async (req,res)=>{
    try {
        const {_id} = req.user;
        const {carId} = req.body
        const car = await Car.findById(carId)

        // Checking is car belongs to the user
        if(car.owner.toString() !== _id.toString()){
            return res.json({ success: false, message: "Unauthorized" });
        }

        car.owner = null;
        car.isAvailable = false;

        await car.save()

        res.json({success: true, message: "Car Removed"})
    } catch (error) {
        console.log(error.message);
        res.json({success: false, message: error.message})
    }
}

// Api to get Dashboard Data
export const getDashboardData = async (req,res) => {
    try {
        const { _id, role } = req.user;

        if(role !== 'owner'){
            return res.json({success: false, message: "Unauthorized"});
        }

        const cars = await Car.find({owner: _id})
        const bookings = await Booking.find({owner: _id}).populate('car').sort({ createdAt: -1});

        const pendingBookings = await Booking.find({owner: _id, status: "pending" })
        const completedBookings = await Booking.find({owner: _id, status: "pending" })

        // Calculate monthlyRevenue from bookings where status is confirmed
        const monthlyRevenue = bookings.slice().filter(booking => booking.status === 'confirmed').reduce((acc, booking)=> acc + booking.price, 0)

        const dashboardData = {
            totalCars: cars.length,
            totalBookings: bookings.length,
            pendingBookings: pendingBookings.length,
            completedBookings: completedBookings.length,
            recentBookings: bookings.slice(0,3),
            monthlyRevenue
        }

        return res.json({ success: true, dashboardData })
        
    } catch (error) {
        console.log(error.message);
        res.json({success: false, message: error.message})
    }
}


// API to update user image

export const updateUserImage = async (req,res)=>{
    try{
       const { _id } = req.user;
       const imageFile = req.file;

        // Upload Image to Imagekit
        const fileBuffer = fs.readFileSync(imageFile.path)
        const response = await imageKit.upload({
            file: fileBuffer,
            fileName: imageFile.originalname,
            folder: '/users'
        })

        var optmizedImageUrl = imageKit.url({
            path: response.filePath,
            transformation : [
                {width: '400'}, // Width resizing
                {quality: 'auto'}, // Auto compression
                { format: 'webp'} // Convert to modern format
            ]
        }); 
       
        const image = optmizedImageUrl;

        await User.findByIdAndUpdate(_id, {image});
        res.json({success: true, message: "Image Updated" })

    } catch(error){
      console.log(error.message);
      res.json({success: false, message: error.message}) 
    }
}