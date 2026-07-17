import Cart from "./cart.model.js";



// =================================
// Get Cart By User
// =================================

export const getCartByUserDB = async (userId) => {

    return await Cart.findOne({

        user: userId,

        isDeleted: false

    })

    .populate({

        path: "items.product",

        populate: [

            {
                path: "category",
                select: "name slug"
            },

            {
                path: "brand",
                select: "name logo"
            }

        ]

    });

};





// =================================
// Create Cart
// =================================

export const createCartDB = async (data) => {

    return await Cart.create(data);

};




// =================================
// Save Cart
// =================================

export const saveCartDB = async (cart) => {

    return await cart.save();

};




// =================================
// Delete Cart (Soft Delete)
// =================================

export const deleteCartDB = async (userId) => {

    return await Cart.findOneAndUpdate(

        {

            user: userId,

            isDeleted: false

        },

        {

            isDeleted: true

        },

        {

            new: true

        }

    );

};




// =================================
// Clear Cart
// =================================

export const clearCartDB = async (userId) => {

    return await Cart.findOneAndUpdate(

        {

            user: userId,

            isDeleted: false

        },

        {

            items: []

        },

        {

            new: true

        }

    );

};




// =================================
// Cart Exists
// =================================

export const cartExistsDB = async (userId) => {

    return await Cart.exists({

        user: userId,

        isDeleted: false

    });

};