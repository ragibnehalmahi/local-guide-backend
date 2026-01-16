import { Router } from 'express';
import { UserRouter } from '../modules/users/user.route';
 import express from 'express';
import { AuthRoutes } from '../modules/auth/auth.route';
// import { PaymentRoutes } from '../modules/payments/payment.route';
import { ListingRouter } from '../modules/listings/listing.route';
import { BookingRouter } from '../modules/bookings/booking.route';
 
import { ReviewRouter } from '../modules/reviews/review.route';
import { PaymentRouter } from '../modules/payments/payment.route';
import { TouristRoutes } from '../modules/tourist/tourist.routes';
// import { ReviewRoutes } from '../modules/reviews/review.route';
 
 const router = express.Router();

const moduleRoutes = [
  
  {
    path: '/users',
    route: UserRouter,
  } ,{
    path: '/auth',
    route: AuthRoutes,
  },
  {
    path: '/payments',
    route: PaymentRouter
  },
  {
    path: '/listing',
     route: ListingRouter,
   },
  {
    path: '/booking',
    route: BookingRouter},
  
   
  {
    path:'/review',
    route:ReviewRouter
  },{
    path:'/tourist',
    route:TouristRoutes
  },



   
];

moduleRoutes.forEach(route => router.use(route.path, route.route));

 


 

 
// router.use('/users', UserRouter);
// router.use('/listings', listingRoutes);

export default router;
