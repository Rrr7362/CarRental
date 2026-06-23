// Function to check Availability of car for a given Date

import Booking from "../models/Booking.js";
import Car from "../models/Car.js";

// const checkAvailability = async (car, pickupDate, returnDate)=>{
//     const bookings = await Booking.find({
//         car,
//         pickupDate: {$lte: returnDate},
//         returnDate: {$gte: pickupDate},
//     })
//     return bookings.length === 0;
// }

// NEW CODE
const checkAvailability = async (carId,pickupDate,returnDate) => {
    const bookings = await Booking.find({
        car: carId ,
        bookingStatus: {
            $in: ["pending","awaiting_payment","confirmed"]},
        pickupDate: { $lte: returnDate },
        returnDate: { $gte: pickupDate }
    });

    return bookings.length === 0;
};

// Api to Check Availability of cars for the given Date and location
export const checkAvailabilityOfCar = async (req, res) => {
    try {
        const { location, pickupDate, returnDate } = req.body;

        // Query 1: Fetch all cars in location
        const cars = await Car.find({
            location,
            isAvailable: true
        });

        if (!cars.length) {
            return res.json({
                success: true,
                availableCars: []
            });
        }

        // Extract all car ids
        const carIds = cars.map(car => car._id);

        // Query 2: Fetch all conflicting bookings at once
        const conflictingBookings = await Booking.find({
            car: { $in: carIds },
            bookingStatus: {
                $in: ["pending", "awaiting_payment", "confirmed"]
            },
            pickupDate: { $lte: returnDate },
            returnDate: { $gte: pickupDate }
        }).select("car");

        // Create set for O(1) lookup
        const conflictingCarIds = new Set(
            conflictingBookings.map(
                booking => booking.car.toString()
            )
        );

        // Filter available cars in memory
        const availableCars = cars.filter(
            car => !conflictingCarIds.has(car._id.toString())
        );

        res.json({
            success: true,
            availableCars
        });

    } catch (error) {
        console.log(error.message);
        res.json({
            success: false,
            message: error.message
        });
    }
};

// export const checkAvailabilityOfCar = async (req,res)=>{
//     try {
//         const {location, pickupDate, returnDate} = req.body

//         // fetch all available cars for the given location
//         const cars = await Car.find({location, isAvailable: true})

//         // check car availability for the given date range using promise
//         const availableCarsPromise = cars.map(async (car)=> {
//             const isAvailable = await checkAvailability(car._id, pickupDate, returnDate)
//             return {...car._doc, isAvailable: isAvailable}
//         })

//         let availableCars = await Promise.all(availableCarsPromise);
//         availableCars = availableCars.filter(car => car.isAvailable === true)

//         res.json({success: true, availableCars})


//     } catch (error) {
//         console.log(error.message);
//         res.json({success: false, message: error.message})
//     }
// } // Initially I used Promise.all to check availability per car, but that leads to N+1 queries, so I optimized it by querying overlapping bookings once and filtering cars in memory, reducing database load significantly.”


// API to Create Booking
// export const createBooking = async (req,res)=>{
//     try {
//         const {_id} = req.user;
//         const {car, pickupDate, returnDate} = req.body;

//         const isAvailable = await checkAvailability(car, pickupDate, returnDate)
//         if(!isAvailable){
//             return res.json({success: false, message: "Car is not available" })
//         }

//         const carData = await Car.findById(car)

//         // Calculate price based on pickupDate and returnDate
//         const picked = new Date(pickupDate);
//         const returned = new Date(returnDate);
//         const noOfDays = Math.ceil((returned - picked) / (1000 * 60 * 60 * 24));
//         const price = carData.pricePerDay * noOfDays;
        
//         await Booking.create({car, owner: carData.owner, user: _id, pickupDate, returnDate, price})

//         res.json({success: true, message: "Booking Created"})

//     } catch (error) {
//         console.log(error.message);
//         res.json({success: false, message: error.message})
//     }
//     // Race Condition - Double Booking 
// }


// new code 
export const createBooking = async (req, res) => {
    try {

        const { _id } = req.user;
        const {car,pickupDate,returnDate,paymentMethod
        } = req.body;
        
        if (!["online", "cod"].includes(paymentMethod)) {
            return res.json({
                success: false,
                message: "Invalid payment method"
            });
        }
        
        const today = new Date();
        const pickup = new Date(pickupDate);
        const returned = new Date(returnDate);

        if (pickup < today) {
            return res.json({
                success: false,
                message: "Pickup date cannot be in the past"
            });
        }

        if (returned <= pickup) {
            return res.json({
                success: false,
                message: "Return date must be after pickup date"
            });
        }
        
        const isAvailable = await checkAvailability(car,pickupDate,returnDate);

        if (!isAvailable) {
            return res.json({success: false,message: "Car is not available"});
        }
        
        const carData = await Car.findById(car);

        if (!carData) {
            return res.json({success: false,message: "Car not found"});
        }
        
        const noOfDays = Math.ceil((returned - pickup) / (1000 * 60 * 60 * 24));

        const price = carData.pricePerDay * noOfDays;
        
        await Booking.create({
            car,
            owner: carData.owner,
            user: _id,
            pickupDate,
            returnDate,
            price,
            paymentMethod,
            bookingStatus: "pending",
            paymentStatus: "pending"
        });

        res.json({
            success: true,
            message: "Booking Created"
        });

    } catch (error) {

        console.log(error.message);

        res.json({
            success: false,
            message: error.message
        });
    }
}

// API to List User Bookings
export const getUserBookings = async (req, res)=>{
    try {
        const {_id} = req.user;
        const bookings = await Booking.find({ user: _id }).populate("car").sort({createdAt: -1})
        res.json({success: true, bookings})

    } catch (error) {
        console.log(error.message);
        res.json({success: false, message: error.message})
    }

    // Pagination and field selection 
}

// API to getOwnerBookings 
export const getOwnerBookings = async (req,res)=>{
    try {
        const { _id } = req.user;
        const bookings = await Booking.find({owner: _id}).populate('car user').select("-user.password").sort({createdAt: -1 })
        res.json({success: true, bookings})

    } catch (error) {
        console.log(error.message);
        res.json({success: false, message: error.message})
    }
    // field selection, pagination, and lean queries.
}


// API to change booking status
// export const changeBookingStatus = async (req,res)=>{
//     try {
//         const {_id} = req.user;
//         const {bookingId, status} = req.body

//         const booking = await Booking.findById(bookingId)

//         if(booking.owner.toString() !== _id.toString()){
//            return res.json({ success: false, message: "Unauthorized"})
//         }

//         booking.status = status;
//         await booking.save();

//         res.json({ success: true, message: "Status updated"})
//     } catch (error) {
//         console.log(error.message);
//         res.json({success: false, message: error.message})
//     }
// }

//NEW CODE 
export const changeBookingStatus = async (req, res) => {
    try {

        const { _id } = req.user;

        const { bookingId, status } = req.body;

        // =========================
        // VALID STATUS CHECK
        // =========================

        const allowedStatuses = [
            "confirmed",
            "cancelled",
            "rejected",
            "completed"
        ];

        if (!allowedStatuses.includes(status)) {
            return res.json({
                success: false,
                message: "Invalid status"
            });
        }

        // =========================
        // FIND BOOKING
        // =========================

        const booking = await Booking.findById(bookingId);

        if (!booking) {
            return res.json({
                success: false,
                message: "Booking not found"
            });
        }

        // =========================
        // OWNER AUTHORIZATION
        // =========================

        if (booking.owner.toString() !== _id.toString()) {
            return res.json({
                success: false,
                message: "Unauthorized"
            });
        }

        // =========================
        // PREVENT CHANGING COMPLETED
        // =========================

        if (
            booking.bookingStatus === "completed"
        ) {
            return res.json({
                success: false,
                message: "Completed booking cannot be modified"
            });
        }

        // =========================
        // REJECT BOOKING
        // =========================

        if (status === "rejected") {

            booking.bookingStatus = "rejected";

            await booking.save();

            return res.json({
                success: true,
                message: "Booking rejected"
            });
        }

        // =========================
        // CANCEL BOOKING
        // =========================

        if (status === "cancelled") {

            booking.bookingStatus = "cancelled";

            await booking.save();

            return res.json({
                success: true,
                message: "Booking cancelled"
            });
        }

        // =========================
        // COMPLETE BOOKING
        // =========================

        if (status === "completed") {

            booking.bookingStatus = "completed";

            await booking.save();

            return res.json({
                success: true,
                message: "Booking completed"
            });
        }

        // =========================
        // CONFIRM BOOKING
        // =========================

        if (status === "confirmed") {

            // =====================
            // COD FLOW
            // =====================

            if (booking.paymentMethod === "cod") {

                booking.bookingStatus = "confirmed";

                booking.paymentStatus = "pending";

                booking.approvedAt = new Date();

                await booking.save();

                return res.json({
                    success: true,
                    message: "COD booking confirmed"
                });
            }

            // =====================
            // ONLINE FLOW
            // =====================

            if (booking.paymentMethod === "online") {

                booking.bookingStatus = "awaiting_payment";

                booking.paymentStatus = "pending";

                booking.approvedAt = new Date();

                // 30 MINUTES PAYMENT WINDOW
                booking.expiresAt = new Date(
                    Date.now() + 30 * 60 * 1000
                );

                await booking.save();

                return res.json({
                    success: true,
                    message: "Booking approved. Awaiting payment."
                });
            }
        }

        res.json({
            success: false,
            message: "Something went wrong"
        });

    } catch (error) {

        console.log(error.message);

        res.json({
            success: false,
            message: error.message
        });
    }
};


