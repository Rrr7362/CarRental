import express from "express";

import { protect } from "../middleware/auth.js";

import {
    createCheckoutSession,
    verifyStripePayment
} from "../controllers/paymentController.js";

const paymentRouter = express.Router();

paymentRouter.post(
    "/create-checkout-session",
    createCheckoutSession
);

paymentRouter.post(
    "/verify-payment",
    verifyStripePayment
);

export default paymentRouter;