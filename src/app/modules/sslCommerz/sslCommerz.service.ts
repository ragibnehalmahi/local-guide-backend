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
      success_url: `${process.env.SSL_SUCCESS_BACKEND_URL?.includes("5000") ? "https://local-guide-backend-1-7iay.onrender.com/api/v1/payments/success" : process.env.SSL_SUCCESS_BACKEND_URL}?transactionId=${payload.transactionId}&amount=${payload.amount}`,
      fail_url: `${process.env.SSL_FAIL_BACKEND_URL?.includes("5000") ? "https://local-guide-backend-1-7iay.onrender.com/api/v1/payments/fail" : process.env.SSL_FAIL_BACKEND_URL}?transactionId=${payload.transactionId}&amount=${payload.amount}`,
      cancel_url: `${process.env.SSL_CANCEL_BACKEND_URL?.includes("5000") ? "https://local-guide-backend-1-7iay.onrender.com/api/v1/payments/cancel" : process.env.SSL_CANCEL_BACKEND_URL}?transactionId=${payload.transactionId}&amount=${payload.amount}`,
      ipn_url: process.env.SSL_IPN_URL?.includes("5000") ? "https://local-guide-backend-1-7iay.onrender.com/api/v1/payments/validate-payment" : process.env.SSL_IPN_URL,
      
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



// // src/app/modules/sslCommerz/sslCommerz.service.ts
// import axios from "axios";
// import https from "https";
// import httpStatus from "http-status-codes";
// import AppError from "../../utils/AppError";
// import { ISSLCommerz } from "./sslCommerz.interface";

// const sslPaymentInit = async (payload: ISSLCommerz) => {
//   try {
//     console.log("🚀 Starting SSLCommerz payment...");
    
//     // ✅ Use correct API version (v4)
//     const sslApiUrl = process.env.SSL_PAYMENT_API || 
//       "https://sandbox.sslcommerz.com/gwprocess/v4/api.php";
    
//     console.log("🔗 API URL:", sslApiUrl);
//     console.log("🏪 Store ID:", process.env.SSL_STORE_ID);

//     const data = {
//       store_id: process.env.SSL_STORE_ID,
//       store_passwd: process.env.SSL_STORE_PASS,
//       total_amount: payload.amount,
//       currency: "BDT",
//       tran_id: payload.transactionId,
      
//       // ✅ Backend callback URLs
//       success_url: `${process.env.SSL_SUCCESS_BACKEND_URL}?transactionId=${payload.transactionId}&amount=${payload.amount}`,
//       fail_url: `${process.env.SSL_FAIL_BACKEND_URL}?transactionId=${payload.transactionId}&amount=${payload.amount}`,
//       cancel_url: `${process.env.SSL_CANCEL_BACKEND_URL}?transactionId=${payload.transactionId}&amount=${payload.amount}`,
//       ipn_url: process.env.SSL_IPN_URL,
      
//       shipping_method: "NO",
//       product_name: "Tour Booking",
//       product_category: "Tourism",
//       product_profile: "non-physical-goods",
//       cus_name: payload.name,
//       cus_email: payload.email,
//       cus_add1: payload.address || "N/A",
//       cus_city: "Dhaka",
//       cus_state: "Dhaka",
//       cus_postcode: "1000",
//       cus_country: "Bangladesh",
//       cus_phone: payload.phoneNumber,
//     };

//     // ✅ SSL Agent for development
//     const httpsAgent = new https.Agent({
//       rejectUnauthorized: false, // Allow self-signed certs in dev
//     });

//     const response = await axios({
//       method: "POST",
//       url: sslApiUrl,
//       data,
//       headers: { 
//         "Content-Type": "application/x-www-form-urlencoded" 
//       },
//       httpsAgent: httpsAgent,
//       timeout: 30000,
//     });

//     console.log("✅ SSLCommerz Response Status:", response.status);
    
//     if (!response.data || response.data.status !== 'SUCCESS') {
//       throw new AppError(
//         httpStatus.BAD_REQUEST, 
//         response.data?.failedreason || "SSLCommerz initialization failed"
//       );
//     }

//     return response.data;
    
//   } catch (error: any) {
//     console.error("❌ SSLCommerz Error:", {
//       message: error.message,
//       code: error.code,
//       response: error.response?.data,
//     });
    
//     throw new AppError(
//       httpStatus.BAD_REQUEST, 
//       error.response?.data?.failedreason || error.message || "Payment initialization failed"
//     );
//   }
// };

// const validatePayment = async (payload: any) => {
//   try {
//     console.log("🔍 Validating payment with val_id:", payload.val_id);
    
//     const validationUrl = process.env.SSL_VALIDATION_API || 
//       "https://sandbox.sslcommerz.com/validator/api/validationserverAPI.php";
    
//     const url = `${validationUrl}?val_id=${payload.val_id}&store_id=${process.env.SSL_STORE_ID}&store_passwd=${process.env.SSL_STORE_PASS}`;
    
//     console.log("🔗 Validation URL:", url);

//     const httpsAgent = new https.Agent({
//       rejectUnauthorized: false,
//     });

//     const response = await axios({
//       method: "GET",
//       url: url,
//       httpsAgent: httpsAgent,
//       timeout: 30000,
//     });

//     console.log("✅ Validation Response:", response.data);
//     return response.data;
    
//   } catch (error: any) {
//     console.error("❌ Validation Error:", error.message);
//     throw new AppError(
//       httpStatus.BAD_REQUEST, 
//       `Payment validation failed: ${error.message}`
//     );
//   }
// };

// export const SSLService = {
//   sslPaymentInit,
//   validatePayment,
// };


// // src/app/modules/sslCommerz/sslCommerz.service.ts
// import axios from "axios";
// import https from "https";
// import httpStatus from "http-status-codes";
// import AppError from "../../utils/AppError";
// import { ISSLCommerz } from "./sslCommerz.interface";

// const sslPaymentInit = async (payload: ISSLCommerz) => {
//   try {
//     console.log("🚀 Starting SSLCommerz payment with data:", {
//       amount: payload.amount,
//       transactionId: payload.transactionId,
//       storeId: process.env.SSL_STORE_ID,
//       apiUrl: process.env.SSL_PAYMENT_API
//     });

//     const data = {
//       store_id: process.env.SSL_STORE_ID || "testbox",
//       store_passwd: process.env.SSL_STORE_PASS || "qwerty",
//       total_amount: payload.amount,
//       currency: "BDT",
//       tran_id: payload.transactionId,
//       success_url: `${process.env.SSL_SUCCESS_BACKEND_URL}?transactionId=${payload.transactionId}&amount=${payload.amount}&status=success`,
//       fail_url: `${process.env.SSL_FAIL_BACKEND_URL}?transactionId=${payload.transactionId}&amount=${payload.amount}&status=fail`,
//       cancel_url: `${process.env.SSL_CANCEL_BACKEND_URL}?transactionId=${payload.transactionId}&amount=${payload.amount}&status=cancel`,
//       ipn_url: process.env.SSL_IPN_URL || "http://localhost:5000/api/v1/payments/ipn",
//       shipping_method: "NO",
//       product_name: "Tour Booking",
//       product_category: "Tourism",
//       product_profile: "non-physical-goods",
//       cus_name: payload.name,
//       cus_email: payload.email,
//       cus_add1: payload.address || "N/A",
//       cus_add2: "N/A",
//       cus_city: "Dhaka",
//       cus_state: "Dhaka",
//       cus_postcode: "1000",
//       cus_country: "Bangladesh",
//       cus_phone: payload.phoneNumber,
//       cus_fax: "N/A",
//       ship_name: "N/A",
//       ship_add1: "N/A",
//       ship_add2: "N/A",
//       ship_city: "N/A",
//       ship_state: "N/A",
//       ship_postcode: "1000",
//       ship_country: "Bangladesh",
//       multi_card_name: "",
//       allowed_bin: "",
//     };

//     // ✅ Custom HTTPS agent with timeout
//     const httpsAgent = new https.Agent({
//       rejectUnauthorized: false, // Development এ false করুন
//       keepAlive: true,
//       timeout: 15000, // 15 seconds
//     });

//     const response = await axios({
//       method: "POST",
//       url: "https://sandbox.sslcommerz.com/gwprocess/v4/api.php", // ✅ Direct URL
//       data,
//       headers: { 
//         "Content-Type": "application/x-www-form-urlencoded",
//         "Accept": "application/json"
//       },
//       httpsAgent: httpsAgent,
//       timeout: 20000, // 20 seconds
//       maxRedirects: 5,
//     });

//     console.log("✅ SSLCommerz Response received:", {
//       status: response.status,
//       data: response.data
//     });

//     return response.data;
//   } catch (error: any) {
//     console.error("❌ SSLCommerz Error Details:", {
//       name: error.name,
//       message: error.message,
//       code: error.code,
//       config: {
//         url: error.config?.url,
//         method: error.config?.method,
//         timeout: error.config?.timeout
//       },
//       response: error.response?.data
//     });

//     // ✅ Specific error handling
//     if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
//       throw new AppError(
//         httpStatus.REQUEST_TIMEOUT,
//         "SSLCommerz server is taking too long to respond. Please try again."
//       );
//     }

//     if (error.code === 'ENOTFOUND') {
//       throw new AppError(
//         httpStatus.BAD_REQUEST,
//         "Cannot connect to SSLCommerz. Please check your internet connection."
//       );
//     }

//     throw new AppError(
//       httpStatus.BAD_REQUEST, 
//       `Payment initialization failed: ${error.message || "Unknown error"}`
//     );
//   }
// };
// const validatePayment = async (payload: any) => {
//  try {
//     const response = await axios({
//       method: "GET",
//       url: `${process.env.SSL_VALIDATION_API}?val_id=${payload.val_id}&store_id=${process.env.SSL_STORE_ID}&store_passwd=${process.env.SSL_STORE_PASS}`,
//     });

//     return response.data;
//   } catch (error: any) {
//     console.error("SSL validation error:", error?.response?.data || error.message);
//     throw new AppError(httpStatus.BAD_REQUEST, `Payment Validation Error: ${error.message}`);
//   }
// };

// export const SSLService = {
//   sslPaymentInit,
//   validatePayment,
// };


// // src/app/modules/sslCommerz/sslCommerz.service.ts
// import axios from "axios";
// import https from "https"; // ✅ https import করুন
// import httpStatus from "http-status-codes";
// import AppError from "../../utils/AppError";
// import { ISSLCommerz } from "./sslCommerz.interface";

// const sslPaymentInit = async (payload: ISSLCommerz) => {
//   try {
//     const data = {
//       store_id: process.env.SSL_STORE_ID,
//       store_passwd: process.env.SSL_STORE_PASS,
//       total_amount: payload.amount,
//       currency: "BDT",
//       tran_id: payload.transactionId,
//       success_url: `${process.env.SSL_SUCCESS_BACKEND_URL}?transactionId=${payload.transactionId}&amount=${payload.amount}&status=success`,
//       fail_url: `${process.env.SSL_FAIL_BACKEND_URL}?transactionId=${payload.transactionId}&amount=${payload.amount}&status=fail`,
//       cancel_url: `${process.env.SSL_CANCEL_BACKEND_URL}?transactionId=${payload.transactionId}&amount=${payload.amount}&status=cancel`,
//       ipn_url: process.env.SSL_IPN_URL,
//       shipping_method: "N/A",
//       product_name: "Tour",
//       product_category: "Service",
//       product_profile: "general",
//       cus_name: payload.name,
//       cus_email: payload.email,
//       cus_add1: payload.address,
//       cus_add2: "N/A",
//       cus_city: "Dhaka",
//       cus_state: "Dhaka",
//       cus_postcode: "1000",
//       cus_country: "Bangladesh",
//       cus_phone: payload.phoneNumber,
//       cus_fax: "N/A",
//       ship_name: "N/A",
//       ship_add1: "N/A",
//       ship_add2: "N/A",
//       ship_city: "N/A",
//       ship_state: "N/A",
//       ship_postcode: 1000,
//       ship_country: "N/A",
//     };

//     // ✅ Custom https agent তৈরি করুন
//     const httpsAgent = new https.Agent({
//       rejectUnauthorized: process.env.NODE_ENV === 'production' ? true : false,
//       // Development এ SSL verification বন্ধ করবে
//     });

//     const response = await axios({
//       method: "POST",
//       url: process.env.SSL_PAYMENT_API,
//       data,
//       headers: { 
//         "Content-Type": "application/x-www-form-urlencoded" 
//       },
//       httpsAgent: httpsAgent, // ✅ Custom agent ব্যবহার করুন
//       timeout: 30000, // 30 seconds timeout
//     });

//     console.log("✅ SSLCommerz Response:", response.data);
//     return response.data;
//   } catch (error: any) {
//     console.error("❌ SSL init error details:", {
//       message: error.message,
//       code: error.code,
//       response: error.response?.data,
//       url: process.env.SSL_PAYMENT_API
//     });
    
//     // ✅ Detailed error handling
//     if (error.code === 'UNABLE_TO_VERIFY_LEAF_SIGNATURE') {
//       throw new AppError(
//         httpStatus.BAD_REQUEST, 
//         "SSL certificate verification failed. Please check SSLCommerz configuration."
//       );
//     }
    
//     if (error.code === 'ECONNREFUSED') {
//       throw new AppError(
//         httpStatus.BAD_REQUEST,
//         "Cannot connect to SSLCommerz. Please check your internet connection."
//       );
//     }
    
//     throw new AppError(
//       httpStatus.BAD_REQUEST, 
//       error.response?.data?.message || error.message || "SSLCommerz initialization failed"
//     );
//   }
// };

// const validatePayment = async (payload: any) => {
//   try {
//     // ✅ Validation এর জন্যও same agent ব্যবহার করুন
//     const httpsAgent = new https.Agent({
//       rejectUnauthorized: process.env.NODE_ENV === 'production' ? true : false,
//     });

//     const response = await axios({
//       method: "GET",
//       url: `${process.env.SSL_VALIDATION_API}?val_id=${payload.val_id}&store_id=${process.env.SSL_STORE_ID}&store_passwd=${process.env.SSL_STORE_PASS}`,
//       httpsAgent: httpsAgent,
//       timeout: 50000,
//     });

//     return response.data;
//   } catch (error: any) {
//     console.error("SSL validation error:", error?.response?.data || error.message);
//     throw new AppError(httpStatus.BAD_REQUEST, `Payment Validation Error: ${error.message}`);
//   }
// };

// export const SSLService = {
//   sslPaymentInit,
//   validatePayment,
// };

// /* eslint-disable @typescript-eslint/no-explicit-any */
// import axios from "axios";
// import httpStatus from "http-status-codes";
// import AppError from "../../utils/AppError";
//   // adjust path to your env helper
// import { ISSLCommerz } from "./sslCommerz.interface";

// const sslPaymentInit = async (payload: ISSLCommerz) => {
//   try {
//     const data = {
//         store_id: process.env.SSL_STORE_ID,
//     //   store_id: envVars.SSL.STORE_ID,
//       store_passwd: process.env.SSL_STORE_PASS,
//       total_amount: payload.amount,
//     //   total_amount: payload.amount,
//       currency: "BDT",
//       tran_id: payload.transactionId,
//       success_url: `${process.env.SSL_SUCCESS_BACKEND_URL}?transactionId=${payload.transactionId}&amount=${payload.amount}&status=success`,
//       fail_url: `${process.env.SSL_FAIL_BACKEND_URL}?transactionId=${payload.transactionId}&amount=${payload.amount}&status=fail`,
//       cancel_url: `${process.env.SSL_CANCEL_BACKEND_URL}?transactionId=${payload.transactionId}&amount=${payload.amount}&status=cancel`,
//       ipn_url: process.env.SSL_IPN_URL,
//       shipping_method: "N/A",
//       product_name: "Tour",
//       product_category: "Service",
//       product_profile: "general",
//       cus_name: payload.name,
//       cus_email: payload.email,
//       cus_add1: payload.address,
//       cus_add2: "N/A",
//       cus_city: "Dhaka",
//       cus_state: "Dhaka",
//       cus_postcode: "1000",
//       cus_country: "Bangladesh",
//       cus_phone: payload.phoneNumber,
//       cus_fax: "N/A",
//       ship_name: "N/A",
//       ship_add1: "N/A",
//       ship_add2: "N/A",
//       ship_city: "N/A",
//       ship_state: "N/A",
//       ship_postcode: 1000,
//       ship_country: "N/A",
//     };

//     const response = await axios({
//       method: "POST",
//       url: process.env.SSL_PAYMENT_API,
//       data,
//       headers: { "Content-Type": "application/x-www-form-urlencoded" },
//     });

//     return response.data;
//   } catch (error: any) {
//     console.error("SSL init error:", error?.response?.data || error.message || error);
//     throw new AppError(httpStatus.BAD_REQUEST, error.message || "SSLCommerz init failed");
//   }
// };

// const validatePayment = async (payload: any) => {
//   try {
//     const response = await axios({
//       method: "GET",
//       url: `${process.env.SSL_VALIDATION_API}?val_id=${payload.val_id}&store_id=${process.env.SSL_STORE_ID}&store_passwd=${process.env.SSL_STORE_PASS}`,
//     });

//     return response.data;
//   } catch (error: any) {
//     console.error("SSL validation error:", error?.response?.data || error.message);
//     throw new AppError(httpStatus.BAD_REQUEST, `Payment Validation Error: ${error.message}`);
//   }
// };

// export const SSLService = {
//   sslPaymentInit,
//   validatePayment,
// };