import User from "../models/User.js"
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import Car from "../models/Car.js"

// Generate jwt token
const generateToken = (userId)=> {
    const payload = userId; // string or js object store multiple things like role, email ,etc...
    return jwt.sign(payload, process.env.JWT_SECRET )
}

// Register User
export const registerUser = async (req,res)=> {
    try {
        const {name, email, password} = req.body

        if(!name || !email || !password || password.length < 8){
            return res.json({success: false, message: 'Fill all the fields'})
        }

        const userExists = await User.findOne({email})
        if(userExists){
            return res.json({success: false, message: 'User already exists'})
        }

        const hashedPassword = await bcrypt.hash(password, 10)
        const user = await User.create({name, email, password: hashedPassword})
        const token = generateToken(user._id.toString())
        res.json({success: true, token})


    } catch (error) {
        console.log(error.message);
        res.json({success: false, message: error.message})
    }
}

//Login User
export const loginUser = async (req,res)=>{
    try {
        const {email, password} = req.body
        // if(!email || !password){
        //     return res.json({success:false,message:"All fields required"})
        // }
        const user = await User.findOne({email})
        if(!user){
            return res.json({success: false, message: "User not found" })
        }
        const isMatch = await bcrypt.compare(password, user.password)
        if(!isMatch){
            return res.json({success: false, message: "Invalid email or password" })
        }
        const token = generateToken(user._id.toString())
        res.json({success: true, token})

    } catch (error) {
        console.log(error.message);
        res.json({success: false, message: error.message})
    }
}

// export const loginUser = async (req,res)=>{
//     try {
//         const {email, password} = req.body

//         console.log("LOGIN HIT");
//         console.log("Email:", email);

//         const user = await User.findOne({email})

//         if(!user){
//             console.log("User not found");
//             return res.json({success: false, message: "User not found"})
//         }

//         const isMatch = await bcrypt.compare(password, user.password)

//         console.log("Password Match:", isMatch);

//         if(!isMatch){
//             return res.json({success: false, message: "Invalid credentials"})
//         }

//         const token = generateToken(user._id.toString())

//         res.json({success: true, token})

//     } catch (error) {
//         console.log(error.message);
//         res.json({success: false, message: error.message})
//     }
// }


// Getr user data using token( JWT )
export const getUserData = async (req,res) => {
    try {
        const {user} = req;
        res.json({success: true, user})
    } catch (error) {
        console.log(error.message);
        res.json({success: false, message: error.message})
    }
}


// Get all cars for the Frontend
export const getCars = async (req,res) => {
    try {
        const cars = await Car.find({isAvailable: true})
        res.json({success: true, cars})
    } catch (error) {
        console.log(error.message);
        res.json({success: false, message: error.message})
    }
}