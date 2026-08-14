import * as couponRepository from "./coupon.repository.js";


// ================================
// Create Coupon
// ================================

export const createCouponService = async(
    data,
    userId
)=>{

    const existing =
    await couponRepository.getCouponByCodeDB(
        data.code
    );

    if(existing){
        throw new Error(
            "Coupon code already exists"
        );
    }

    data.createdBy = userId;

    return await couponRepository.createCouponDB(data);

};


// ================================
// Get All Coupons
// ================================

export const getCouponsService = async()=>{

    return await couponRepository.getCouponsDB();

};


// ================================
// Get Single Coupon
// ================================

export const getCouponByIdService = async(id)=>{

    const coupon =
    await couponRepository.getCouponByIdDB(id);

    if(!coupon){
        throw new Error("Coupon not found");
    }

    return coupon;

};


// ================================
// Update Coupon
// ================================

export const updateCouponService = async(
    id,
    data
)=>{

    const coupon =
    await couponRepository.getCouponByIdDB(id);

    if(!coupon){
        throw new Error("Coupon not found");
    }

    return await couponRepository.updateCouponDB(
        id,
        data
    );

};


// ================================
// Delete Coupon
// ================================

export const deleteCouponService = async(id)=>{

    const coupon =
    await couponRepository.deleteCouponDB(id);

    if(!coupon){
        throw new Error("Coupon not found");
    }

    return coupon;

};


// ================================
// VALIDATE + CALCULATE COUPON
// (checkout/cart pe "Apply Coupon" button ke liye)
// ================================

export const validateCouponService = async(
    code,
    cartTotal,
    userId
)=>{

    // --------------------------------------------------
    // 1. FIND COUPON
    // --------------------------------------------------

    const coupon =
    await couponRepository.getCouponByCodeDB(code);

    if(!coupon){
        throw new Error("Invalid coupon code");
    }


    // --------------------------------------------------
    // 2. STATUS CHECK
    // --------------------------------------------------

    if(coupon.status !== "ACTIVE"){
        throw new Error("This coupon is not active");
    }


    // --------------------------------------------------
    // 3. DATE CHECK
    // --------------------------------------------------

    const today = new Date();

    if(today < coupon.startDate){
        throw new Error("This coupon is not started yet");
    }

    if(today > coupon.endDate){
        throw new Error("This coupon has expired");
    }


    // --------------------------------------------------
    // 4. MIN CART VALUE CHECK
    // --------------------------------------------------

    if(cartTotal < coupon.minCartValue){
        throw new Error(
            `Minimum cart value should be ₹${coupon.minCartValue} to use this coupon`
        );
    }


    // --------------------------------------------------
    // 5. GLOBAL USAGE LIMIT CHECK
    // --------------------------------------------------

    if(
        coupon.usageLimit !== null &&
        coupon.usedCount >= coupon.usageLimit
    ){
        throw new Error(
            "This coupon has reached its usage limit"
        );
    }


    // --------------------------------------------------
    // 6. PER-USER USAGE LIMIT CHECK
    // --------------------------------------------------

    const userUsage =
    coupon.usedBy.find(
        (u) => u.user.toString() === userId.toString()
    );

    const userUsedCount =
    userUsage ? userUsage.count : 0;

    if(userUsedCount >= coupon.usageLimitPerUser){
        throw new Error(
            "You have already used this coupon"
        );
    }


    // --------------------------------------------------
    // 7. CALCULATE DISCOUNT
    // --------------------------------------------------

    let discountAmount = 0;

    if(coupon.discountType === "PERCENTAGE"){

        discountAmount =
        (cartTotal * coupon.discountValue) / 100;

        if(
            coupon.maxDiscountAmount !== null &&
            discountAmount > coupon.maxDiscountAmount
        ){
            discountAmount = coupon.maxDiscountAmount;
        }

    }
    else{

        discountAmount = coupon.discountValue;

    }


    // Discount cart total se zyada nahi ho sakta

    if(discountAmount > cartTotal){
        discountAmount = cartTotal;
    }

    discountAmount = Math.round(discountAmount);


    const finalAmount =
    cartTotal - discountAmount;


    // --------------------------------------------------
    // 8. RETURN
    // --------------------------------------------------

    return {

        valid:true,

        coupon:{
            couponId: coupon._id,
            code: coupon.code,
            discountType: coupon.discountType,
            discountValue: coupon.discountValue
        },

        discountAmount,

        finalAmount

    };

};


// ================================
// INCREMENT USAGE
// (order successfully place hone ke baad call hoga)
// ================================

export const incrementCouponUsageService = async(
    couponId,
    userId
)=>{

    return await couponRepository.incrementCouponUsageDB(
        couponId,
        userId
    );

};