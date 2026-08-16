// import * as couponRepository from "./coupon.repository.js";


// // ================================
// // Create Coupon
// // ================================

// export const createCouponService = async(
//     data,
//     userId
// )=>{

//     const existing =
//     await couponRepository.getCouponByCodeDB(
//         data.code
//     );

//     if(existing){
//         throw new Error(
//             "Coupon code already exists"
//         );
//     }

//     data.createdBy = userId;

//     return await couponRepository.createCouponDB(data);

// };


// // ================================
// // Get All Coupons
// // ================================

// export const getCouponsService = async()=>{

//     return await couponRepository.getCouponsDB();

// };


// // ================================
// // Get Single Coupon
// // ================================

// export const getCouponByIdService = async(id)=>{

//     const coupon =
//     await couponRepository.getCouponByIdDB(id);

//     if(!coupon){
//         throw new Error("Coupon not found");
//     }

//     return coupon;

// };


// // ================================
// // Update Coupon
// // ================================

// export const updateCouponService = async(
//     id,
//     data
// )=>{

//     const coupon =
//     await couponRepository.getCouponByIdDB(id);

//     if(!coupon){
//         throw new Error("Coupon not found");
//     }

//     return await couponRepository.updateCouponDB(
//         id,
//         data
//     );

// };


// // ================================
// // Delete Coupon
// // ================================

// export const deleteCouponService = async(id)=>{

//     const coupon =
//     await couponRepository.deleteCouponDB(id);

//     if(!coupon){
//         throw new Error("Coupon not found");
//     }

//     return coupon;

// };


// // ================================
// // VALIDATE + CALCULATE COUPON
// // (checkout/cart pe "Apply Coupon" button ke liye)
// // ================================

// export const validateCouponService = async(
//     code,
//     cartTotal,
//     userId
// )=>{

//     // --------------------------------------------------
//     // 1. FIND COUPON
//     // --------------------------------------------------

//     const coupon =
//     await couponRepository.getCouponByCodeDB(code);

//     if(!coupon){
//         throw new Error("Invalid coupon code");
//     }


//     // --------------------------------------------------
//     // 2. STATUS CHECK
//     // --------------------------------------------------

//     if(coupon.status !== "ACTIVE"){
//         throw new Error("This coupon is not active");
//     }


//     // --------------------------------------------------
//     // 3. DATE CHECK
//     // --------------------------------------------------

//     const today = new Date();

//     if(today < coupon.startDate){
//         throw new Error("This coupon is not started yet");
//     }

//     if(today > coupon.endDate){
//         throw new Error("This coupon has expired");
//     }


//     // --------------------------------------------------
//     // 4. MIN CART VALUE CHECK
//     // --------------------------------------------------

//     if(cartTotal < coupon.minCartValue){
//         throw new Error(
//             `Minimum cart value should be ₹${coupon.minCartValue} to use this coupon`
//         );
//     }


//     // --------------------------------------------------
//     // 5. GLOBAL USAGE LIMIT CHECK
//     // --------------------------------------------------

//     if(
//         coupon.usageLimit !== null &&
//         coupon.usedCount >= coupon.usageLimit
//     ){
//         throw new Error(
//             "This coupon has reached its usage limit"
//         );
//     }


//     // --------------------------------------------------
//     // 6. PER-USER USAGE LIMIT CHECK
//     // --------------------------------------------------

//     const userUsage =
//     coupon.usedBy.find(
//         (u) => u.user.toString() === userId.toString()
//     );

//     const userUsedCount =
//     userUsage ? userUsage.count : 0;

//     if(userUsedCount >= coupon.usageLimitPerUser){
//         throw new Error(
//             "You have already used this coupon"
//         );
//     }


//     // --------------------------------------------------
//     // 7. CALCULATE DISCOUNT
//     // --------------------------------------------------

//     let discountAmount = 0;

//     if(coupon.discountType === "PERCENTAGE"){

//         discountAmount =
//         (cartTotal * coupon.discountValue) / 100;

//         if(
//             coupon.maxDiscountAmount !== null &&
//             discountAmount > coupon.maxDiscountAmount
//         ){
//             discountAmount = coupon.maxDiscountAmount;
//         }

//     }
//     else{

//         discountAmount = coupon.discountValue;

//     }


//     // Discount cart total se zyada nahi ho sakta

//     if(discountAmount > cartTotal){
//         discountAmount = cartTotal;
//     }

//     discountAmount = Math.round(discountAmount);


//     const finalAmount =
//     cartTotal - discountAmount;


//     // --------------------------------------------------
//     // 8. RETURN
//     // --------------------------------------------------

//     return {

//         valid:true,

//         coupon:{
//             couponId: coupon._id,
//             code: coupon.code,
//             discountType: coupon.discountType,
//             discountValue: coupon.discountValue
//         },

//         discountAmount,

//         finalAmount

//     };

// };


// // ================================
// // INCREMENT USAGE
// // (order successfully place hone ke baad call hoga)
// // ================================

// export const incrementCouponUsageService = async(
//     couponId,
//     userId
// )=>{

//     return await couponRepository.incrementCouponUsageDB(
//         couponId,
//         userId
//     );

// };

import * as couponRepository
    from "./coupon.repository.js";


// ======================================================
// CREATE COUPON
// ======================================================

export const createCouponService = async (
    data,
    userId
) => {

    // --------------------------------------------------
    // COPY DATA
    // --------------------------------------------------

    const couponData = {
        ...data
    };


    // --------------------------------------------------
    // NORMALIZE CODE
    // --------------------------------------------------

    couponData.code =
        couponData.code
            .trim()
            .toUpperCase();


    // --------------------------------------------------
    // DUPLICATE CHECK
    // --------------------------------------------------

    const existing =
        await couponRepository.getCouponByCodeDB(
            couponData.code
        );


    if (existing) {

        throw new Error(
            "Coupon code already exists"
        );

    }


    // --------------------------------------------------
    // DATE CHECK
    // --------------------------------------------------

    const startDate =
        new Date(
            couponData.startDate
        );

    const endDate =
        new Date(
            couponData.endDate
        );


    if (
        Number.isNaN(
            startDate.getTime()
        )
    ) {

        throw new Error(
            "Invalid start date"
        );

    }


    if (
        Number.isNaN(
            endDate.getTime()
        )
    ) {

        throw new Error(
            "Invalid end date"
        );

    }


    if (
        endDate <= startDate
    ) {

        throw new Error(
            "End date must be after start date"
        );

    }


    // --------------------------------------------------
    // PERCENTAGE CHECK
    // --------------------------------------------------

    if (
        couponData.discountType ===
        "PERCENTAGE"
    ) {

        if (
            Number(couponData.discountValue) > 100
        ) {

            throw new Error(
                "Percentage discount cannot be more than 100%"
            );

        }

    }


    // --------------------------------------------------
    // CREATED BY ADMIN
    // --------------------------------------------------

    couponData.createdBy =
        userId;


    // --------------------------------------------------
    // DEFAULT STATUS
    // --------------------------------------------------

    if (!couponData.status) {

        couponData.status =
            "ACTIVE";

    }


    // --------------------------------------------------
    // CREATE
    // --------------------------------------------------

    return await couponRepository.createCouponDB(
        couponData
    );

};


// ======================================================
// GET ALL COUPONS
// ======================================================

export const getCouponsService = async () => {

    return await couponRepository.getCouponsDB();

};


// ======================================================
// GET SINGLE COUPON
// ======================================================

export const getCouponByIdService = async (
    id
) => {

    const coupon =
        await couponRepository.getCouponByIdDB(
            id
        );


    if (!coupon) {

        throw new Error(
            "Coupon not found"
        );

    }


    return coupon;

};


// ======================================================
// UPDATE COUPON
// ======================================================

export const updateCouponService = async (
    id,
    data
) => {

    const coupon =
        await couponRepository.getCouponByIdDB(
            id
        );


    if (!coupon) {

        throw new Error(
            "Coupon not found"
        );

    }


    // Check duplicate code
    if (data.code) {

        const code =
            data.code
                .trim()
                .toUpperCase();


        const existing =
            await couponRepository.getCouponByCodeDB(
                code
            );


        if (
            existing &&
            existing._id.toString() !==
            id.toString()
        ) {

            throw new Error(
                "Coupon code already exists"
            );

        }


        data.code = code;

    }


    // Check dates if both supplied
    if (
        data.startDate &&
        data.endDate
    ) {

        if (
            new Date(data.endDate) <=
            new Date(data.startDate)
        ) {

            throw new Error(
                "End date must be after start date"
            );

        }

    }


    return await couponRepository.updateCouponDB(
        id,
        data
    );

};


// ======================================================
// DELETE COUPON
// ======================================================

export const deleteCouponService = async (
    id
) => {

    const coupon =
        await couponRepository.deleteCouponDB(
            id
        );


    if (!coupon) {

        throw new Error(
            "Coupon not found"
        );

    }


    return coupon;

};


// ======================================================
// CUSTOMER VALIDATE COUPON
// Abhi isko touch nahi karna
// ======================================================

export const validateCouponService = async (
    code,
    cartTotal,
    userId
) => {

    const coupon =
        await couponRepository.getCouponByCodeDB(
            code
        );


    if (!coupon) {

        throw new Error(
            "Invalid coupon code"
        );

    }


    if (
        coupon.status !==
        "ACTIVE"
    ) {

        throw new Error(
            "This coupon is not active"
        );

    }


    const today =
        new Date();


    if (
        today < coupon.startDate
    ) {

        throw new Error(
            "This coupon is not started yet"
        );

    }


    if (
        today > coupon.endDate
    ) {

        throw new Error(
            "This coupon has expired"
        );

    }


    if (
        cartTotal <
        coupon.minCartValue
    ) {

        throw new Error(
            `Minimum cart value should be ₹${coupon.minCartValue} to use this coupon`
        );

    }


    if (
        coupon.usageLimit !== null &&
        coupon.usedCount >=
        coupon.usageLimit
    ) {

        throw new Error(
            "This coupon has reached its usage limit"
        );

    }


    const userUsage =
        coupon.usedBy.find(
            (u) =>
                u.user.toString() ===
                userId.toString()
        );


    const userUsedCount =
        userUsage
            ? userUsage.count
            : 0;


    if (
        userUsedCount >=
        coupon.usageLimitPerUser
    ) {

        throw new Error(
            "You have already used this coupon"
        );

    }


    // ==================================================
    // CALCULATE DISCOUNT
    // ==================================================

    let discountAmount = 0;


    if (
        coupon.discountType ===
        "PERCENTAGE"
    ) {

        discountAmount =
            (
                cartTotal *
                coupon.discountValue
            ) / 100;


        if (
            coupon.maxDiscountAmount !== null &&
            discountAmount >
            coupon.maxDiscountAmount
        ) {

            discountAmount =
                coupon.maxDiscountAmount;

        }

    }
    else {

        discountAmount =
            coupon.discountValue;

    }


    if (
        discountAmount >
        cartTotal
    ) {

        discountAmount =
            cartTotal;

    }


    discountAmount =
        Math.round(
            discountAmount
        );


    const finalAmount =
        cartTotal -
        discountAmount;


    return {

        valid: true,

        coupon: {

            couponId:
                coupon._id,

            code:
                coupon.code,

            discountType:
                coupon.discountType,

            discountValue:
                coupon.discountValue

        },

        discountAmount,

        finalAmount

    };

};


// ======================================================
// INCREMENT USAGE
// Order successful hone ke baad use hoga
// ======================================================

export const incrementCouponUsageService =
    async (
        couponId,
        userId
    ) => {

        return await couponRepository
            .incrementCouponUsageDB(
                couponId,
                userId
            );

    };