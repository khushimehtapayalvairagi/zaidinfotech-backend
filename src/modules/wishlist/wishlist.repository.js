import Wishlist from "./wishlist.model.js";


// =======================================
// Find Wishlist By User Id
// =======================================

export const findWishlistByUserId = async (userId) => {

    return await Wishlist.findOne({
        user: userId
    });

};




// =======================================
// Create New Wishlist
// =======================================

export const createWishlist = async (userId) => {


    const wishlist = new Wishlist({

        user: userId,

        products: []

    });


    return await wishlist.save();

};




// =======================================
// Add Product In Wishlist
// =======================================

export const addProduct = async (
    wishlistId,
    productId
) => {


    return await Wishlist.findByIdAndUpdate(

        wishlistId,

        {
            $push:{
                products:{
                    product: productId
                }
            }
        },

        {
            new:true
        }

    );

};




// =======================================
// Remove Product From Wishlist
// =======================================

export const removeProduct = async (
    wishlistId,
    productId
) => {


    return await Wishlist.findByIdAndUpdate(

        wishlistId,

        {
            $pull:{
                products:{
                    product:productId
                }
            }
        },

        {
            new:true
        }

    );

};




// =======================================
// Get Wishlist With Product Details
// =======================================

export const getWishlistDetails = async(userId)=>{


    return await Wishlist.findOne({

        user:userId

    })

    .populate({

        path:"products.product",

        select:
        "title price discountedPrice imageUrl quantity brand"

    });


};