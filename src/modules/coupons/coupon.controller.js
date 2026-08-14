import * as couponService from "./coupon.service.js";


// ================================
// Create Coupon
// ================================

export const createCoupon = async(req,res)=>{

try{

    const coupon =
    await couponService.createCouponService(
        req.body,
        req.user._id
    );

    res.status(201).json({
        success:true,
        message:"Coupon created successfully",
        coupon
    });

}
catch(error){

    res.status(400).json({
        success:false,
        message:error.message
    });

}

};


// ================================
// Get All Coupons
// ================================

export const getCoupons = async(req,res)=>{

try{

    const coupons =
    await couponService.getCouponsService();

    res.status(200).json({
        success:true,
        coupons
    });

}
catch(error){

    res.status(400).json({
        success:false,
        message:error.message
    });

}

};


// ================================
// Get Single Coupon
// ================================

export const getCouponById = async(req,res)=>{

try{

    const coupon =
    await couponService.getCouponByIdService(
        req.params.id
    );

    res.status(200).json({
        success:true,
        coupon
    });

}
catch(error){

    res.status(404).json({
        success:false,
        message:error.message
    });

}

};


// ================================
// Update Coupon
// ================================

export const updateCoupon = async(req,res)=>{

try{

    const coupon =
    await couponService.updateCouponService(
        req.params.id,
        req.body
    );

    res.status(200).json({
        success:true,
        message:"Coupon updated",
        coupon
    });

}
catch(error){

    res.status(400).json({
        success:false,
        message:error.message
    });

}

};


// ================================
// Delete Coupon
// ================================

export const deleteCoupon = async(req,res)=>{

try{

    await couponService.deleteCouponService(
        req.params.id
    );

    res.status(200).json({
        success:true,
        message:"Coupon deleted"
    });

}
catch(error){

    res.status(400).json({
        success:false,
        message:error.message
    });

}

};


// ================================
// Apply / Validate Coupon (Customer)
// ================================

export const applyCoupon = async(req,res)=>{

try{

    const { code, cartTotal } = req.body;

    const result =
    await couponService.validateCouponService(
        code,
        Number(cartTotal),
        req.user._id
    );

    res.status(200).json({
        success:true,
        message:"Coupon applied successfully",
        ...result
    });

}
catch(error){

    res.status(400).json({
        success:false,
        message:error.message
    });

}

};