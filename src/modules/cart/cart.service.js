import Product from "../products/product.model.js";
import Inventory from "../inventory/inventory.model.js";

import {

getCartByUserDB,
createCartDB,
saveCartDB,
clearCartDB

} from "./cart.repository.js";

// =================================
// Add To Cart
// =================================

export const addToCartService = async (

    userId,

    data

)=>{

    const {

        product,

        quantity

    } = data;



    // Product Check

    const existingProduct =
    await Product.findById(product);



    if(!existingProduct){

        throw new Error(
            "Product not found"
        );

    }



    // Inventory Check

    const inventory =
    await Inventory.findOne({

        product,

        isDeleted:false

    });



    if(!inventory){

        throw new Error(
            "Inventory not found"
        );

    }



    const availableStock =

        inventory.currentStock -

        inventory.reservedStock;



    if(availableStock < quantity){

        throw new Error(
            "Insufficient stock"
        );

    }



    // Get Cart

    let cart =
    await getCartByUserDB(userId);



    // Cart Not Exists

    if(!cart){

        cart =
        await createCartDB({

            user:userId,

            items:[
                {

                    product,

                    quantity

                }

            ]

        });

        return cart;

    }



    // Product Already Exists

    const existingItem =
    cart.items.find(

        item=>

        item.product._id.toString()

        ===

        product

    );



    if(existingItem){

        existingItem.quantity += quantity;
    }

    else{

        cart.items.push({

            product,

            quantity

        });

    }



    return await saveCartDB(cart);

};

// =================================
// Get Cart
// =================================

export const getCartService = async(

    userId

)=>{

    return await getCartByUserDB(
        userId
    );

};

// =================================
// Clear Cart
// =================================

export const clearCartService = async(

    userId

)=>{

    return await clearCartDB(
        userId
    );

};
