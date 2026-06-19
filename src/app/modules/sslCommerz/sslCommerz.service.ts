// src/app/modules/sslCommerz/sslCommerz.service.ts
import axios from "axios";
import https from "https";
import httpStatus from "http-status-codes";
import AppError from "../../utils/AppError";
import { ISSLCommerz } from "./sslCommerz.interface";

const sslPaymentInit = async (payload: ISSLCommerz) => {
  try {
    console.log("🚀 SSLCommerz Init:", {
      amount: payload.amount,
      transactionId: payload.transactionId
    });

    // ✅ Use correct SSLCommerz API
    const sslApiUrl = process.env.SSL_PAYMENT_API ||
      "https://sandbox.sslcommerz.com/gwprocess/v4/api.php";

    console.log("🔗 API URL:", sslApiUrl);

    const data = {
      store_id: process.env.SSL_STORE_ID,
      store_passwd: process.env.SSL_STORE_PASS,
      total_amount: payload.amount,
      currency: "BDT",
      tran_id: payload.transactionId,

      // ✅ Callback URLs
      success_url: `${process.env.SSL_SUCCESS_BACKEND_URL}?transactionId=${payload.transactionId}&amount=${payload.amount}`,
      fail_url: `${process.env.SSL_FAIL_BACKEND_URL}?transactionId=${payload.transactionId}&amount=${payload.amount}`,
      cancel_url: `${process.env.SSL_CANCEL_BACKEND_URL}?transactionId=${payload.transactionId}&amount=${payload.amount}`,
      ipn_url: process.env.SSL_IPN_URL,

      shipping_method: "NO",
      product_name: "Tour Booking",
      product_category: "Tourism",
      product_profile: "non-physical-goods",
      cus_name: payload.name,
      cus_email: payload.email,
      cus_add1: payload.address || "N/A",
      cus_city: "Dhaka",
      cus_state: "Dhaka",
      cus_postcode: "1000",
      cus_country: "Bangladesh",
      cus_phone: payload.phoneNumber,
    };

    // ✅ SSL Agent
    const httpsAgent = new https.Agent({
      rejectUnauthorized: false,
    });

    const response = await axios({
      method: "POST",
      url: sslApiUrl,
      data,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      httpsAgent: httpsAgent,
      timeout: 30000,
    });

    console.log("✅ SSLCommerz Response:", response.data.status);

    if (!response.data || response.data.status !== 'SUCCESS') {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        response.data?.failedreason || "SSLCommerz initialization failed"
      );
    }

    return response.data;

  } catch (error: any) {
    console.error("❌ SSLCommerz Error:", error.message);

    throw new AppError(
      httpStatus.BAD_REQUEST,
      error.message || "Payment initialization failed"
    );
  }
};

const validatePayment = async (payload: any) => {
  try {
    console.log("🔍 SSLCommerz Validation for val_id:", payload.val_id);

    const validationUrl = process.env.SSL_VALIDATION_API ||
      "https://sandbox.sslcommerz.com/validator/api/validationserverAPI.php";

    const url = `${validationUrl}?val_id=${payload.val_id}&store_id=${process.env.SSL_STORE_ID}&store_passwd=${process.env.SSL_STORE_PASS}`;

    console.log("🔗 Validation URL:", url);

    const httpsAgent = new https.Agent({
      rejectUnauthorized: false,
    });

    const response = await axios({
      method: "GET",
      url: url,
      httpsAgent: httpsAgent,
      timeout: 30000,
    });

    console.log("✅ Validation Response:", response.data.status);
    return response.data;

  } catch (error: any) {
    console.error("❌ Validation Error:", error.message);
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `Payment validation failed: ${error.message}`
    );
  }
};

export const SSLService = {
  sslPaymentInit,
  validatePayment,
};



