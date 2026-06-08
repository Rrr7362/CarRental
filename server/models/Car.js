import mongoose from "mongoose";

const { ObjectId } = mongoose.Schema.Types;

const carSchema = new mongoose.Schema({
    owner: { type: ObjectId, ref: 'User', required: true },
    brand: { type: String, required: true, trim: true },
    model: { type: String, required: true, trim: true },
    image: { type: String, required: true },
    // multiple images 
    year: { type: Number, required: true },
    category: { type: String, required: true },
    //enum: ["SUV", "Sedan", "Hatchback"],
    seating_capacity: { type: Number, required: true },
    fuel_type: { type: String,required: true },
    //enum: ["petrol", "diesel", "electric"],
    transmission: { type: String, required: true },
    //  enum: ["manual", "automatic"],
    pricePerDay: { type: Number, required: true, min: 0 },
    location: { type: String, required: true, trim: true, index : true},//“Using index: true on a string field creates a normal B-Tree index that speeds up exact match queries, but it does not support geospatial queries like distance or nearby search.”
    description: { type: String, required: true },
    isAvailable: { type: Boolean, default: true },
    // rating and review features
}, { timestamps: true });

const Car = mongoose.model('Car', carSchema);

export default Car;