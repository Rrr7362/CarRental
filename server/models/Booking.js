// import mongoose from "mongoose";
// const {ObjectId} = mongoose.Schema.Types

// const bookingSchema = new mongoose.Schema({
//    car: {type: ObjectId, ref: "Car", required: true},
//    user: {type: ObjectId, ref: "User", required: true},
//    owner: {type: ObjectId, ref: "User", required: true},
//    pickupDate: {type: Date, required: true},
//    returnDate: {type: Date, required: true},
//    status: {type: String, enum: ["pending", "confirmed", "cancelled"], default: "pending"},
//    price: {type: Number, required: true}
// },{timestamps: true})

// const Booking = mongoose.model('Booking', bookingSchema);

// export default Booking 


// NEW CODE 

import mongoose from "mongoose";

const { ObjectId } = mongoose.Schema.Types;

const bookingSchema = new mongoose.Schema(
  {
    car: {
      type: ObjectId,
      ref: "Car",
      required: true,
    },

    user: {
      type: ObjectId,
      ref: "User",
      required: true,
    },

    owner: {
      type: ObjectId,
      ref: "User",
      required: true,
    },

    pickupDate: {
      type: Date,
      required: true,
    },

    returnDate: {
      type: Date,
      required: true,
    },

    // =========================
    // BOOKING STATUS
    // =========================

    bookingStatus: {
      type: String,
      enum: [
        "pending",
        "awaiting_payment",
        "confirmed",
        "cancelled",
        "rejected",
        "completed",
      ],
      default: "pending",
    },

    // =========================
    // PAYMENT STATUS
    // =========================

    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "cod"],
      default: "pending",
    },

    // =========================
    // PAYMENT METHOD
    // =========================

    paymentMethod: {
      type: String,
      enum: ["online", "cod"],
      required: true,
    },

    // =========================
    // PAYMENT DETAILS
    // =========================

   stripeSessionId: {
   type: String,
   default: null
    },

   stripePaymentIntentId: {
   type: String,
   default: null
   },

    // =========================
    // TIMESTAMPS
    // =========================

    approvedAt: {
      type: Date,
      default: null,
    },

    paidAt: {
      type: Date,
      default: null,
    },

    expiresAt: {
      type: Date,
      default: null,
    },

    // =========================
    // PRICE
    // =========================

    price: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

const Booking = mongoose.model("Booking", bookingSchema);

export default Booking;