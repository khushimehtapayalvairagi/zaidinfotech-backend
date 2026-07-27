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

        quantity,
        originalPrice,
        discountAmount,
        finalPrice,

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
// Update Cart Quantity
// =================================

export const updateCartQuantityService = async (
    userId,
    productId,
    quantity
) => {

    // Quantity validation
    if (
        !Number.isInteger(quantity) ||
        quantity < 1
    ) {

        throw new Error(
            "Quantity must be at least 1"
        );

    }


    // Product check
    const product =
        await Product.findById(productId);


    if (!product) {

        throw new Error(
            "Product not found"
        );

    }


    // Inventory check
    const inventory =
        await Inventory.findOne({

            product: productId,

            isDeleted: false

        });


    if (!inventory) {

        throw new Error(
            "Inventory not found"
        );

    }


    const availableStock =
        inventory.currentStock -
        inventory.reservedStock;


    if (quantity > availableStock) {

        throw new Error(
            `Only ${availableStock} item(s) available in stock`
        );

    }


    // Get cart
    const cart =
        await getCartByUserDB(userId);


    if (!cart) {

        throw new Error(
            "Cart not found"
        );

    }


    // Find item
    const cartItem =
        cart.items.find(

            item =>
                item.product._id.toString() ===
                productId.toString()

        );


    if (!cartItem) {

        throw new Error(
            "Product not found in cart"
        );

    }


    // Update quantity
    cartItem.quantity =
        quantity;


    await saveCartDB(cart);


    // Return updated populated cart
    return await getCartByUserDB(userId);

};

export const removeCartItemService = async (
    userId,
    productId
) => {

    const cart =
        await getCartByUserDB(userId);


    if (!cart) {

        throw new Error(
            "Cart not found"
        );

    }


    const oldLength =
        cart.items.length;


    cart.items =
        cart.items.filter(

            item =>
                item.product._id.toString() !==
                productId.toString()

        );


    if (
        cart.items.length ===
        oldLength
    ) {

        throw new Error(
            "Product not found in cart"
        );

    }


    await saveCartDB(cart);


    return await getCartByUserDB(userId);

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




















