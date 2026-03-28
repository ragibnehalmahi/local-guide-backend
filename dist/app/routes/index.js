"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const user_route_1 = require("../modules/users/user.route");
const express_1 = __importDefault(require("express"));
const auth_route_1 = require("../modules/auth/auth.route");
// import { PaymentRoutes } from '../modules/payments/payment.route';
const listing_route_1 = require("../modules/listings/listing.route");
const booking_route_1 = require("../modules/bookings/booking.route");
const review_route_1 = require("../modules/reviews/review.route");
const payment_route_1 = require("../modules/payments/payment.route");
const tourist_routes_1 = require("../modules/tourist/tourist.routes");
const meta_routes_1 = require("../modules/meta/meta.routes");
const earnings_route_1 = __importDefault(require("../modules/guide/earnings.route"));
const router = express_1.default.Router();
const moduleRoutes = [
    {
        path: '/users',
        route: user_route_1.UserRouter,
    }, {
        path: '/auth',
        route: auth_route_1.AuthRoutes,
    },
    {
        path: '/payments',
        route: payment_route_1.PaymentRouter
    },
    {
        path: '/listing',
        route: listing_route_1.ListingRouter,
    },
    {
        path: '/booking',
        route: booking_route_1.BookingRouter
    },
    {
        path: '/review',
        route: review_route_1.ReviewRouter
    }, {
        path: '/tourist',
        route: tourist_routes_1.TouristRoutes
    }, {
        path: '/meta',
        route: meta_routes_1.MetaRouter
    },
    {
        path: '/earnings',
        route: earnings_route_1.default
    }
];
moduleRoutes.forEach(route => router.use(route.path, route.route));
// router.use('/users', UserRouter);
// router.use('/listings', listingRoutes);
exports.default = router;
