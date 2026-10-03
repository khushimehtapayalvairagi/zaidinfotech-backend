
import mongoose from "mongoose";

import Cart from "./cart.model.js";

import Product from "../products/product.model.js";

import {
    getCartDB,
    saveCartDB
} from "./cart.repository.js";

import { getActiveOffersDB } from "../offer/offer.repository.js";
import {
    calculateDiscountedPrice,
    matchOfferToProduct
} from "../../common/utils/offerCalculator.js";


// ======================================================
// HELPER: GET OFFER APPLIED PRICE
// ======================================================

const getOfferAppliedPrice = async (productData, sellingPrice) => {

    const activeOffers = await getActiveOffersDB();

    const offer = matchOfferToProduct(
        productData,
        activeOffers
    );

    if (!offer) {

        return {
            finalPrice: sellingPrice,
            appliedOffer: null
        };
    }

    const finalPrice = calculateDiscountedPrice(
        sellingPrice,
        offer
    );

    return {

        finalPrice,

        appliedOffer: {
            offerId: offer._id,
            title: offer.title,
            discountType: offer.discountType,
            discountValue: offer.discountValue
        }
    };
};
// ======================================================
// INVENTORY MODEL
// ======================================================

let Inventory = null;

try {

    Inventory = mongoose.model("Inventory");

} catch (error) {

    Inventory = null;

}


// ======================================================
// HELPER: GET AVAILABLE STOCK
// ======================================================

const getAvailableStock = async (productId) => {

    if (!Inventory) {
        return null;
    }

    const inventory =
        await Inventory.findOne({
            product: productId
        });

    if (!inventory) {
        return null;
    }

    const currentStock =
        Number(
            inventory.currentStock || 0
        );

    const reservedStock =
        Number(
            inventory.reservedStock || 0
        );

    const availableStock =
        inventory.availableStock !== undefined
            ? Number(inventory.availableStock)
            : Math.max(
                currentStock - reservedStock,
                0
            );

    return availableStock;
};


// ======================================================
// HELPER: GET PRODUCT PRICE
// ======================================================
const getProductPrice = (productData, customerType) => {
    const pricing = productData?.pricing || {};

    const retailPrice = Number(pricing.retailPrice);
    const wholesalePrice = Number(pricing.wholesalePrice);

    const isBusiness =
        String(customerType || "").toUpperCase() === "BUSINESS";

    const sellingPrice =
        isBusiness && Number.isFinite(wholesalePrice) && wholesalePrice > 0
            ? wholesalePrice
            : retailPrice;

    const mrp = Number(pricing.mrp ?? sellingPrice);

    if (!Number.isFinite(sellingPrice) || sellingPrice < 0) {
        throw new Error("Product selling price is invalid");
    }

    return {
        sellingPrice,
        mrp,
        discountAmount: Math.max(mrp - sellingPrice, 0)
    };
};


// ======================================================
// ADD TO CART
// ======================================================

export const addToCartService = async (
    userId,
    data,
    customerType
) => {

    console.log(
        "ADD TO CART SERVICE DATA:",
        data
    );


    // --------------------------------------------------
    // 1. GET DATA
    // --------------------------------------------------

    const {
        product,
        quantity = 1
    } = data || {};


    // --------------------------------------------------
    // 2. VALIDATE PRODUCT
    // --------------------------------------------------

    if (!product) {

        throw new Error(
            "Product id is required"
        );
    }


    if (
        !mongoose.Types.ObjectId.isValid(
            product
        )
    ) {

        throw new Error(
            "Invalid product id"
        );
    }


    // --------------------------------------------------
    // 3. VALIDATE QUANTITY
    // --------------------------------------------------

    const qty =
        Number(quantity);


    if (
        !Number.isInteger(qty) ||
        qty < 1
    ) {

        throw new Error(
            "Quantity must be at least 1"
        );
    }


    // --------------------------------------------------
    // 4. FIND PRODUCT
    // --------------------------------------------------

    const productData =
        await Product.findById(product);


    if (!productData) {

        throw new Error(
            "Product not found"
        );
    }


    console.log(
        "PRODUCT FROM DB:",
        productData
    );


    // --------------------------------------------------
    // 5. GET PRICE
    // --------------------------------------------------

    const {
        sellingPrice,
        mrp,
        discountAmount
    } = getProductPrice(
        productData,
        customerType
    );
    const {
        finalPrice,
        appliedOffer
    } = await getOfferAppliedPrice(
        productData,
        sellingPrice
    );

    console.log(
        "PRODUCT PRICE:",
        {
            sellingPrice,
            mrp,
            discountAmount
        }
    );


    // --------------------------------------------------
    // 6. CHECK INVENTORY
    // --------------------------------------------------

    const availableStock =
        await getAvailableStock(
            productData._id
        );


    if (
        availableStock !== null &&
        availableStock < qty
    ) {

        throw new Error(

            availableStock === 0

                ? "Product is out of stock"

                : `Only ${availableStock} item(s) available`

        );
    }


    // --------------------------------------------------
    // 7. GET CART
    // --------------------------------------------------

    let cart =
        await getCartDB(
            userId
        );


    // --------------------------------------------------
    // 8. CREATE CART
    // --------------------------------------------------

    if (!cart) {

        cart =
            new Cart({

                user: userId,

                items: []

            });
    }


    // --------------------------------------------------
    // 9. FIND EXISTING ITEM
    // --------------------------------------------------

    const existingItem =
        cart.items.find(
            item =>
                item.product &&
                item.product.toString() ===
                productData._id.toString()
        );


    // --------------------------------------------------
    // 10. EXISTING PRODUCT
    // --------------------------------------------------
    if (existingItem) {

        const newQuantity =
            Number(existingItem.quantity || 0) + qty;

        if (
            availableStock !== null &&
            newQuantity > availableStock
        ) {
            throw new Error(
                `Only ${availableStock} item(s) available`
            );
        }

        existingItem.quantity = newQuantity;
        existingItem.price = sellingPrice;
        existingItem.originalPrice = mrp;
        existingItem.discountAmount = discountAmount;

        // CHANGED: ab offer applied price save hoga
        existingItem.finalPrice = finalPrice;
        existingItem.appliedOffer = appliedOffer;
    }

    // --------------------------------------------------
    // 11. NEW PRODUCT
    // --------------------------------------------------

    else {

        cart.items.push({

            product: productData._id,
            quantity: qty,
            price: sellingPrice,
            originalPrice: mrp,
            discountAmount: discountAmount,

            // CHANGED
            finalPrice: finalPrice,
            appliedOffer: appliedOffer
        });
    }

    // --------------------------------------------------
    // 12. SAVE CART
    // --------------------------------------------------

    console.log(
        "CART BEFORE SAVE:",
        cart
    );


    const savedCart =
        await saveCartDB(
            cart
        );


    // --------------------------------------------------
    // 13. POPULATE PRODUCT
    // --------------------------------------------------

    await savedCart.populate({

        path: "items.product",

        select:
            "name slug sku images pricing category brand"

    });


    return savedCart;
};


// ======================================================
// GET CART
// ======================================================

export const getCartService = async (
    userId
) => {

    const cart =
        await getCartDB(
            userId
        );


    if (!cart) {

        return {

            user: userId,

            items: [],

            subtotal: 0,

            total: 0

        };
    }


    await cart.populate({

        path: "items.product",

        select:
            "name slug sku images pricing category brand"

    });


    return cart;
};


// ======================================================
// UPDATE CART QUANTITY
// ======================================================

export const updateCartQuantityService = async (
    userId,
    productId,
    quantity,
    customerType
) => {

    // --------------------------------------------------
    // VALIDATE PRODUCT ID
    // --------------------------------------------------

    if (
        !mongoose.Types.ObjectId.isValid(
            productId
        )
    ) {

        throw new Error(
            "Invalid product id"
        );
    }


    // --------------------------------------------------
    // VALIDATE QUANTITY
    // --------------------------------------------------

    const qty =
        Number(quantity);


    if (
        !Number.isInteger(qty) ||
        qty < 1
    ) {

        throw new Error(
            "Quantity must be at least 1"
        );
    }


    // --------------------------------------------------
    // GET CART
    // --------------------------------------------------

    const cart =
        await getCartDB(
            userId
        );


    if (!cart) {

        throw new Error(
            "Cart not found"
        );
    }


    // --------------------------------------------------
    // FIND ITEM
    // --------------------------------------------------

    const item =
        cart.items.find(
            item =>
                item.product &&
                item.product.toString() ===
                productId.toString()
        );


    if (!item) {

        throw new Error(
            "Product not found in cart"
        );
    }


    // --------------------------------------------------
    // CHECK INVENTORY
    // --------------------------------------------------

    const availableStock =
        await getAvailableStock(
            productId
        );


    if (
        availableStock !== null &&
        qty > availableStock
    ) {

        throw new Error(
            `Only ${availableStock} item(s) available`
        );
    }


    // --------------------------------------------------
    // GET PRODUCT
    // --------------------------------------------------

    const productData =
        await Product.findById(
            productId
        );


    if (!productData) {

        throw new Error(
            "Product not found"
        );
    }


    // --------------------------------------------------
    // GET PRICE
    // --------------------------------------------------

    const {
        sellingPrice,
        mrp,
        discountAmount
    } = getProductPrice(
        productData,
        customerType

    );

    const {
        finalPrice,
        appliedOffer
    } = await getOfferAppliedPrice(
        productData,
        sellingPrice
    );
    // --------------------------------------------------
    // UPDATE ITEM
    // --------------------------------------------------

    item.quantity = qty;
    item.price = sellingPrice;
    item.originalPrice = mrp;
    item.discountAmount = discountAmount;

    // CHANGED
    item.finalPrice = finalPrice;
    item.appliedOffer = appliedOffer;

    // --------------------------------------------------
    // SAVE
    // --------------------------------------------------

    const savedCart =
        await saveCartDB(
            cart
        );


    // --------------------------------------------------
    // POPULATE
    // --------------------------------------------------

    await savedCart.populate({

        path: "items.product",

        select:
            "name slug sku images pricing category brand"

    });


    return savedCart;
};


// ======================================================
// REMOVE CART ITEM
// ======================================================

export const removeCartItemService = async (
    userId,
    productId
) => {

    if (
        !mongoose.Types.ObjectId.isValid(
            productId
        )
    ) {

        throw new Error(
            "Invalid product id"
        );
    }


    const cart =
        await getCartDB(
            userId
        );


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
                item.product &&
                item.product.toString() !==
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


    const savedCart =
        await saveCartDB(
            cart
        );


    await savedCart.populate({

        path: "items.product",

        select:
            "name slug sku images pricing category brand"

    });


    return savedCart;
};


// ======================================================
// CLEAR CART
// ======================================================

export const clearCartService = async (
    userId
) => {

    const cart =
        await getCartDB(
            userId
        );


    if (!cart) {

        throw new Error(
            "Cart not found"
        );
    }


    cart.items = [];


    const savedCart =
        await saveCartDB(
            cart
        );


    return savedCart;
};