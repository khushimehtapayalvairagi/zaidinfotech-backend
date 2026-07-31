// import Cart from "./cart.model.js";



// // =================================
// // Get Cart By User
// // =================================

// export const getCartByUserDB = async (userId) => {

//     return await Cart.findOne({

//         user: userId,

//         isDeleted: false

//     })

//     .populate({

//         path: "items.product",

//         populate: [

//             {
//                 path: "category",
//                 select: "name slug"
//             },
//               {
//      path:"offer"
//    },

//             {
//                 path: "brand",
//                 select: "name logo"
//             }

//         ]
//         .populate("coupon")

//     });

// };



// export const updateCartDB = async (cart) => {
//     return await cart.save();
// };

// // =================================
// // Create Cart
// // =================================

// export const createCartDB = async (data) => {

//     return await Cart.create(data);

// };




// // =================================
// // Save Cart
// // =================================

// export const saveCartDB = async (cart) => {

//     return await cart.save();

// };




// // =================================
// // Delete Cart (Soft Delete)
// // =================================

// export const deleteCartDB = async (userId) => {

//     return await Cart.findOneAndUpdate(

//         {

//             user: userId,

//             isDeleted: false

//         },

//         {

//             isDeleted: true

//         },

//         {

//             new: true

//         }

//     );

// };




// // =================================
// // Clear Cart
// // =================================

// export const clearCartDB = async (userId) => {

//     return await Cart.findOneAndUpdate(

//         {

//             user: userId,

//             isDeleted: false

//         },

//         {

//             items: []

//         },

//         {

//             new: true

//         }

//     );

// };




// // =================================
// // Cart Exists
// // =================================

// export const cartExistsDB = async (userId) => {

//     return await Cart.exists({

//         user: userId,

//         isDeleted: false

//     });

// };
























import Cart from "./cart.model.js";


// ======================================================
// GET CART BY USER
// ======================================================

export const getCartDB = async (userId) => {
    try {

        const cart = await Cart.findOne({
            user: userId
        });

        return cart;

    } catch (error) {

        console.error(
            "GET CART DB ERROR:",
            error
        );

        throw error;
    }
};


// ======================================================
// SAVE CART
// ======================================================

export const saveCartDB = async (cart) => {
    try {

        const savedCart = await cart.save();

        return savedCart;

    } catch (error) {

        console.error(
            "SAVE CART DB ERROR:",
            error
        );

        throw error;
    }
};


// ======================================================
// DELETE CART
// ======================================================

export const deleteCartDB = async (userId) => {
    try {

        const result =
            await Cart.findOneAndDelete({
                user: userId
            });

        return result;

    } catch (error) {

        console.error(
            "DELETE CART DB ERROR:",
            error
        );

        throw error;
    }
};