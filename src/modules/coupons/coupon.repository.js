import Coupon from "./coupon.model.js";


// ================================
// Create Coupon
// ================================

export const createCouponDB = async(data)=>{

    return await Coupon.create(data);

};


// ================================
// Get All Coupons (Admin)
// ================================

export const getCouponsDB = async()=>{

    return await Coupon.find()
    .sort({ createdAt:-1 });

};


// ================================
// Get Single Coupon by ID
// ================================

export const getCouponByIdDB = async(id)=>{

    return await Coupon.findById(id);

};


// ================================
// Get Coupon by Code
// ================================

export const getCouponByCodeDB = async(code)=>{

    return await Coupon.findOne({
        code: code.toUpperCase().trim()
    });

};


// ================================
// Update Coupon
// ================================

export const updateCouponDB = async(id,data)=>{

    return await Coupon.findByIdAndUpdate(
        id,
        data,
        { new:true }
    );

};


// ================================
// Delete Coupon
// ================================

export const deleteCouponDB = async(id)=>{

    return await Coupon.findByIdAndDelete(id);

};


// ================================
// Increment Usage (atomic)
// ================================

export const incrementCouponUsageDB = async(
    couponId,
    userId
)=>{

    // Pehle check karo user pehle se array me hai kya

    const coupon = await Coupon.findOne({
        _id: couponId,
        "usedBy.user": userId
    });


    if(coupon){

        // User already exist -> uska count badhao

        return await Coupon.findOneAndUpdate(

            {
                _id: couponId,
                "usedBy.user": userId
            },

            {
                $inc:{
                    usedCount:1,
                    "usedBy.$.count":1
                }
            },

            { new:true }

        );

    }


    // Naya user -> array me push karo

    return await Coupon.findByIdAndUpdate(

        couponId,

        {
            $inc:{
                usedCount:1
            },

            $push:{
                usedBy:{
                    user:userId,
                    count:1
                }
            }
        },

        { new:true }

    );

};