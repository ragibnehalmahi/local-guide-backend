import { Request, Response } from "express";
import Booking from "@/models/booking.model";
import { Types } from "mongoose";
import { IGuideEarningsFilter } from "@/interfaces/earnings.interface";
import { paginate } from "@/utils/pagination";
import AppError from "@/utils/appError";

export class GuideEarningsService {
  static async getEarningsStats(guideId: string) {
    const pipeline = [
      {
        $match: {
          guide: new Types.ObjectId(guideId),
          status: { $in: ["CONFIRMED", "COMPLETED"] },
          paymentStatus: "PAID",
        },
      },
      {
        $group: {
          _id: null,
          totalEarnings: { $sum: "$totalPrice" },
          totalBookings: { $sum: 1 },
          completedTours: {
            $sum: { $cond: [{ $eq: ["$status", "COMPLETED"] }, 1, 0] },
          },
          averageRating: { $avg: { $ifNull: ["$review.rating", 0] } },
        },
      },
      {
        $project: {
          _id: 0,
          totalEarnings: { $round: ["$totalEarnings", 2] },
          totalBookings: 1,
          completedTours: 1,
          averageRating: { $round: ["$averageRating", 1] },
          monthlyEarnings: {
            $sum: {
              $cond: [
                {
                  $and: [
                    {
                      $gte: [
                        { $toDate: "$updatedAt" },
                        {
                          $dateFromString: {
                            dateString: {
                              $dateToString: {
                                format: "%Y-%m-01",
                                date: new Date(),
                              },
                            },
                          },
                        },
                      ],
                    },
                    {
                      $lte: [
                        { $toDate: "$updatedAt" },
                        {
                          $dateFromString: {
                            dateString: {
                              $dateToString: {
                                format: "%Y-%m",
                                date: new Date(),
                              },
                            },
                          },
                        },
                      ],
                    },
                  ],
                },
                "$totalPrice",
                0,
              ],
            },
          },
        },
      },
    ];

    const result = await Booking.aggregate(pipeline).exec();
    return {
      success: true,
      data: result[0] || {
        totalEarnings: 0,
        totalBookings: 0,
        completedTours: 0,
        averageRating: 0,
        monthlyEarnings: 0,
      },
    };
  }

  static async getEarningsHistory(
    guideId: string,
    filters: IGuideEarningsFilter,
    page = 1,
    limit = 10,
  ) {
    const matchStage: any = {
      guide: new Types.ObjectId(guideId),
      status: { $in: ["CONFIRMED", "COMPLETED"] },
      paymentStatus: "PAID",
    };

    // Date filtering
    if (filters.dateFrom) {
      matchStage.updatedAt = {
        $gte: new Date(filters.dateFrom),
        ...(filters.dateTo && {
          $lte: new Date(filters.dateTo),
        }),
      };
    }

    // Status filtering
    if (filters.status) {
      matchStage.status = filters.status;
    }

    const pipeline = [
      { $match: matchStage },
      {
        $lookup: {
          from: "listings",
          localField: "listing",
          foreignField: "_id",
          as: "listingDetails",
        },
      },
      { $unwind: "$listingDetails" },
      {
        $lookup: {
          from: "users",
          localField: "tourist",
          foreignField: "_id",
          as: "touristDetails",
        },
      },
      { $unwind: "$touristDetails" },
      {
        $group: {
          _id: {
            year: { $year: "$updatedAt" },
            month: { $month: "$updatedAt" },
          },
          totalAmount: { $sum: "$totalPrice" },
          bookingCount: { $sum: 1 },
          firstBooking: { $min: "$updatedAt" },
          bookings: {
            $push: {
              _id: "$_id",
              listingTitle: "$listingDetails.title",
              touristName: "$touristDetails.name",
              date: "$date",
              guestCount: "$guestCount",
              totalPrice: "$totalPrice",
              status: "$status",
            },
          },
        },
      },
      {
        $sort: {
          "firstBooking": -1,
        },
      },
      {
        $project: {
          _id: 0,
          period: {
            $dateToString: {
              format: "%Y-%m",
              date: "$firstBooking",
            },
          },
          totalAmount: { $round: ["$totalAmount", 2] },
          bookingCount: 1,
          bookings: {
            $slice: ["$bookings", 3], // Show only 3 recent bookings per period
          },
        },
      },
    ];

    const earnings = await Booking.aggregate(pipeline);
    const paginated = paginate(earnings, page, limit);

    return {
      success: true,
      data: paginated.data,
      meta: {
        total: paginated.total,
        page,
        limit,
        pages: paginated.pages,
      },
    };
  }

  static async getEarningsChartData(guideId: string, period: "month" | "year" = "month") {
    const match: any = {
      guide: new Types.ObjectId(guideId),
      status: { $in: ["CONFIRMED", "COMPLETED"] },
      paymentStatus: "PAID",
    };

    const groupBy = period === "month" ? { $month: "$updatedAt" } : { $month: "$updatedAt", $year: "$updatedAt" };

    const pipeline = [
      { $match: match },
      {
        $group: {
          _id: groupBy,
          total: { $sum: "$totalPrice" },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id": 1 } },
    ];

    const chartData = await Booking.aggregate(pipeline);
    return {
      success: true,
      data: chartData.map((item: any) => ({
        label: item._id,
        earnings: Math.round(item.total * 100) / 100,
        bookings: item.count,
      })),
    };
  }
}

export default GuideEarningsService;