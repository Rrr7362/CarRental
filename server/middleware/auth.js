import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next)=>{
  const token = req.headers.authorization?.split(" ")[1];
  if(!token){
    return res.json({success: false, message: "not authorized"})
  }
  try {
    
    const userId = jwt.verify(token, process.env.JWT_SECRET)
    // jwt.decode and jwt.verify
    
    // if(!userId){
    //   return res.json({success: false, message: "Unauthorized"})
    // }
    
    req.user = await User.findById(userId).select("-password")

    // Validate Check 
    if(!req.user){
    return res.json({success: false, message: "User not found"})
    }
    next();
  } catch (error) {
    return res.json({success: false, message: "Unauthorized"})
  }
}