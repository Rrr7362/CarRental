import Booking from "../models/Booking.js";

import stripe from "../configs/stripe.js";


// ======================================
// CREATE STRIPE CHECKOUT SESSION
// ======================================

export const createCheckoutSession = async (
    req,
    res
) => {

    try {

        const { bookingId } = req.body;

        const booking = await Booking.findById(
            bookingId
        ).populate("car");

        if (!booking) {
            return res.json({
                success: false,
                message: "Booking not found"
            });
        }

        // ==========================
        // VALIDATE STATUS
        // ==========================

        if (
            booking.bookingStatus !==
            "awaiting_payment"
        ) {
            return res.json({
                success: false,
                message:
                    "Booking is not ready for payment"
            });
        }

        // ==========================
        // CREATE STRIPE SESSION
        // ==========================

        const session =
            await stripe.checkout.sessions.create({

                payment_method_types: ["card"],

                mode: "payment",

                line_items: [
                    {
                        price_data: {
                            currency: "inr",

                            product_data: {
                                name:
                                    booking.car.brand +
                                    " " +
                                    booking.car.model,
                            },

                            unit_amount:
                                booking.price * 100,
                        },

                        quantity: 1,
                    },
                ],

                success_url:
            `http://localhost:5173/payment-success?bookingId=${booking._id}&session_id={CHECKOUT_SESSION_ID}`,

                cancel_url:
                    `http://localhost:5173/payment-failed?bookingId=${booking._id}`,
            });

        // ==========================
        // SAVE SESSION ID
        // ==========================

        booking.stripeSessionId = session.id;

        await booking.save();

        res.json({
            success: true,
            url: session.url
        });

    } catch (error) {

        console.log(error.message);

        res.json({
            success: false,
            message: error.message
        });
    }
};


// ======================================
// VERIFY PAYMENT
// ======================================

export const verifyStripePayment = async (
    req,
    res
) => {

    try {

        const { sessionId, bookingId } = req.body;

        const session =
            await stripe.checkout.sessions.retrieve(
                sessionId
            );

        // ==========================
        // PAYMENT FAILED
        // ==========================

        if (
            session.payment_status !== "paid"
        ) {
            return res.json({
                success: false,
                message: "Payment not completed"
            });
        }

        const booking = await Booking.findById(
            bookingId
        );

        if (!booking) {
            return res.json({
                success: false,
                message: "Booking not found"
            });
        }

        // ==========================
        // UPDATE BOOKING
        // ==========================

        booking.paymentStatus = "paid";

        booking.bookingStatus = "confirmed";

        booking.paidAt = new Date();

        booking.stripePaymentIntentId =
            session.payment_intent;

        await booking.save();

        res.json({
            success: true,
            message: "Payment verified successfully"
        });
        console.log(session);
        console.log(booking);

    } catch (error) {

        console.log(error.message);

        res.json({
            success: false,
            message: error.message
        });
    }
};