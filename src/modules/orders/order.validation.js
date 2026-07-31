// import Joi from "joi";

// import {
//     ORDER_STATUS
// } from "../../common/constants/orderStatus.js";



// // =======================================
// // CREATE ORDER VALIDATION
// // =======================================

// export const createOrderValidation = Joi.object({


//     orderItems:Joi.array()

//     .items(

//         Joi.object({

//             product:Joi.string()
//             .required(),


//             title:Joi.string()
//             .required(),


//             quantity:Joi.number()
//             .min(1)
//             .required(),


//             price:Joi.number()
//             .required(),


//             imageUrl:Joi.string()
//             .allow("")

//         })

//     )

//     .min(1)

//     .required(),




//     shippingAddress:Joi.object({

//         fullName:Joi.string()
//         .required(),


//         phone:Joi.string()
//         .required(),


//         addressLine:Joi.string()
//         .required(),


//         city:Joi.string()
//         .required(),


//         state:Joi.string()
//         .required(),


//         pincode:Joi.string()
//         .required(),


//         country:Joi.string()
//         .allow(""),


//         landmark:Joi.string()
//         .allow("")


//     })

//     .required(),




//     totalAmount:Joi.number()

//     .required()



// });





// // =======================================
// // UPDATE ORDER STATUS VALIDATION
// // =======================================

// export const updateOrderStatusValidation = Joi.object({


//     status:Joi.string()

//     .valid(

//         ...Object.values(
//             ORDER_STATUS
//         )

//     )

//     .required()


// });





// // =======================================
// // UPDATE PAYMENT STATUS VALIDATION
// // =======================================

// export const updatePaymentStatusValidation = Joi.object({


//     paymentStatus:Joi.string()

//     .valid(

//         "PENDING",
//         "PAID",
//         "FAILED",
//         "REFUNDED"

//     )

//     .required(),



//     paymentId:Joi.string()

//     .allow("")


// });




import Joi from "joi";

import {
  ORDER_STATUS,
} from "../../common/constants/orderStatus.js";

// ======================================================
// CREATE ORDER VALIDATION
// ======================================================

export const createOrderValidation = Joi.object({

  // ====================================================
  // ORDER ITEMS
  // ====================================================

  orderItems: Joi.array()
    .items(

      Joi.object({

        // Product ID
        product: Joi.string()
          .trim()
          .required()
          .messages({
            "any.required":
              "Product is required",

            "string.empty":
              "Product is required",
          }),

        // Product title
        title: Joi.string()
          .trim()
          .required()
          .messages({
            "any.required":
              "Product title is required",

            "string.empty":
              "Product title is required",
          }),

        // Quantity
        quantity: Joi.number()
          .integer()
          .min(1)
          .required()
          .messages({
            "number.base":
              "Quantity must be a number",

            "number.min":
              "Quantity must be at least 1",

            "any.required":
              "Quantity is required",
          }),

        // Original price
        originalPrice: Joi.number()
          .min(0)
          .required()
          .messages({
            "number.base":
              "Original price must be a number",

            "any.required":
              "Original price is required",
          }),

        // Discount
        discountAmount: Joi.number()
          .min(0)
          .default(0),

        // Final selling price
        price: Joi.number()
          .min(0)
          .required()
          .messages({
            "number.base":
              "Product price must be a number",

            "any.required":
              "Product price is required",
          }),

        // Offer can be null
        offer: Joi.string()
          .allow(null, "")
          .default(null),

        // Image can be null / empty
        imageUrl: Joi.string()
          .allow(null, "")
          .default(""),

      })

    )
    .min(1)
    .required()
    .messages({
      "array.min":
        "At least one product is required",

      "any.required":
        "Order items are required",
    }),

  // ====================================================
  // SHIPPING ADDRESS
  // ====================================================

  shippingAddress: Joi.object({

    fullName: Joi.string()
      .trim()
      .required()
      .messages({
        "any.required":
          "Full name is required",

        "string.empty":
          "Full name is required",
      }),

    phone: Joi.string()
      .trim()
      .required()
      .messages({
        "any.required":
          "Phone number is required",

        "string.empty":
          "Phone number is required",
      }),

    addressLine: Joi.string()
      .trim()
      .required()
      .messages({
        "any.required":
          "Address is required",

        "string.empty":
          "Address is required",
      }),

    city: Joi.string()
      .trim()
      .required()
      .messages({
        "any.required":
          "City is required",

        "string.empty":
          "City is required",
      }),

    state: Joi.string()
      .trim()
      .required()
      .messages({
        "any.required":
          "State is required",

        "string.empty":
          "State is required",
      }),

    pincode: Joi.string()
      .trim()
      .required()
      .messages({
        "any.required":
          "Pincode is required",

        "string.empty":
          "Pincode is required",
      }),

    // null bhi accept
    country: Joi.string()
      .allow(null, "")
      .default("India"),

    // null bhi accept
    landmark: Joi.string()
      .allow(null, "")
      .default(""),

  })
    .required()
    .messages({
      "any.required":
        "Shipping address is required",
    }),

  // ====================================================
  // TOTAL
  // ====================================================

  totalAmount: Joi.number()
    .min(0)
    .required()
    .messages({
      "number.base":
        "Total amount must be a number",

      "any.required":
        "Total amount is required",
    }),

  // ====================================================
  // ORDER SOURCE
  // ====================================================

  orderSource: Joi.string()
    .valid(
      "ONLINE",
      "WALK_IN"
    )
    .default("ONLINE"),

});


// ======================================================
// UPDATE ORDER STATUS
// ======================================================

export const updateOrderStatusValidation =
  Joi.object({

    status: Joi.string()
      .valid(
        ...Object.values(
          ORDER_STATUS
        )
      )
      .required(),

  });


// ======================================================
// UPDATE PAYMENT STATUS
// ======================================================

export const updatePaymentStatusValidation =
  Joi.object({

    paymentStatus: Joi.string()
      .valid(
        "PENDING",
        "PAID",
        "FAILED",
        "REFUNDED"
      )
      .required(),

    paymentId: Joi.string()
      .allow(null, ""),

  });