import express from "express";
import "dotenv/config";
import cors from "cors";
import connectDB from "../configs/db.js";
import userRouter from "../routes/userRoutes.js";
import ownerRouter from "../routes/ownerRoutes.js";
import bookingRouter from "../routes/bookingRoutes.js";
import paymentRouter from "../routes/paymentRoutes.js";

// Initialize Express App
const app = express()

// Connect Database
await connectDB()

// Middleware
app.use(cors()); // cors() is Express middleware that handles Cross-Origin Resource Sharing. It inspects the incoming request's Origin header and adds appropriate Access-Control-* response headers so browsers know whether a frontend from a different origin is allowed to access the backend resources.
app.use(express.json()); // express.json() is middleware that intercepts incoming requests with Content-Type: application/json, parses the JSON payload into a JavaScript object, and attaches it to req.body so route handlers can access the request data easily. Without it, req.body will be undefined for JSON requests.

app.get('/', (req,res)=> res.send("Server is running"))
app.use('/api/user', userRouter)
app.use('/api/owner', ownerRouter)
app.use('/api/bookings', bookingRouter)
app.use("/api/payments", paymentRouter);

export default app;

