import * as wishlistRepository from "./wishlist.repository.js";



// =======================================
// Add Product To Wishlist
// =======================================

export const addProductToWishlist = async (
    userId,
    productId
) => {


    // Check existing wishlist

    let wishlist =
        await wishlistRepository.findWishlistByUserId(
            userId
        );



    // If wishlist does not exist
    // create new wishlist

    if(!wishlist){

        wishlist =
        await wishlistRepository.createWishlist(
            userId
        );

    }



    // Check product already exists

    const productExist =
    wishlist.products.some(

        item =>
        item.product.toString() === productId

    );



    if(productExist){

        throw new Error(
            "Product already exists in wishlist"
        );

    }



    // Add product

    const updatedWishlist =
    await wishlistRepository.addProduct(

        wishlist._id,

        productId

    );



    return updatedWishlist;

};




// =======================================
// Get User Wishlist
// =======================================

export const getUserWishlist = async(userId)=>{


    const wishlist =
    await wishlistRepository.getWishlistDetails(
        userId
    );



    if(!wishlist){

        return {

            products:[]

        };

    }



    return wishlist;

};




// =======================================
// Remove Product From Wishlist
// =======================================

export const removeProductFromWishlist = async(

    userId,

    productId

)=>{


    const wishlist =
    await wishlistRepository.findWishlistByUserId(
        userId
    );



    if(!wishlist){

        throw new Error(
            "Wishlist not found"
        );

    }



    const productExist =
    wishlist.products.some(

        item =>
        item.product.toString() === productId

    );



    if(!productExist){

        throw new Error(
            "Product not found in wishlist"
        );

    }



    const updatedWishlist =
    await wishlistRepository.removeProduct(

        wishlist._id,

        productId

    );



    return updatedWishlist;

};