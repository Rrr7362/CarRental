import { useEffect } from "react";

import {
   useSearchParams,
   useNavigate
} from "react-router-dom";

import { useAppContext }
from "../../context/AppContext";

import { toast } from "react-hot-toast";

const PaymentSuccess = () => {

   const { axios } = useAppContext();

   const [searchParams] =
      useSearchParams();

   const navigate = useNavigate();

   useEffect(() => {

      verifyPayment();

   }, []);

   const verifyPayment = async () => {

      try {

         // =========================
         // GET URL PARAMS
         // =========================

         const bookingId =
            searchParams.get(
               "bookingId"
            );

         const sessionId =
            searchParams.get(
               "session_id"
            );

         // =========================
         // VERIFY PAYMENT
         // =========================

         const { data } =
            await axios.post(

               "/api/payments/verify-payment",

               {
                  bookingId,
                  sessionId
               }
            );

         // =========================
         // SUCCESS
         // =========================

         if (data.success) {

            toast.success(
               "Payment Successful"
            );

            setTimeout(() => {

               navigate("/my-bookings");

            }, 2000);

         } else {

            toast.error(
               data.message
            );
         }
         console.log(bookingId);
         console.log(sessionId);

      } catch (error) {

         console.log(error);

         toast.error(
            error.message
         );
      }
   };

   return (

      <div className="flex items-center justify-center h-screen">

         <div className="text-center">

            <h1 className="text-3xl font-bold">
               Payment Successful
            </h1>

            <p className="mt-4">
               Verifying your payment...
            </p>

         </div>

      </div>
   );
};

export default PaymentSuccess;