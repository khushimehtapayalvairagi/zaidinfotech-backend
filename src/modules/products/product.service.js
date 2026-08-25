import {
    createProductDB,
    getProductsDB,
    getProductByIdDB,
    getProductByNameDB,
    updateProductDB,
    deleteProductDB,
    searchProductsDB,
    getShopProductsDB,
    getProductByBarcodeDB,
    findProductsByReceptionist
} from "./product.repository.js";

import Category from "../categories/category.model.js";

import Brand from "../brands/brand.model.js";

import Inventory from "../inventory/inventory.model.js";

import generateSlug from "../../common/utils/generateSlug.js";

import generateSKU from "../../common/utils/generateSKU.js";
import {calculateDiscountedPrice,matchOfferToProduct} from "../../common/utils/offerCalculator.js";
import {
    getActiveOffersDB
} from "../offer/offer.repository.js";

// =====================================================
// PRODUCTS ADDED BY RECEPTIONIST
// =====================================================

export const fetchProductsAddedByReceptionist = async (
    receptionistId
) => {

    const products =
        await findProductsByReceptionist(
            receptionistId
        );

    return products;

};


// =====================================================
// CREATE PRODUCT
// =====================================================

export const createProductService = async (
    data,
    userId,
    files = []
) => {

    try {

        console.log(
            "========== CREATE PRODUCT SERVICE =========="
        );

        console.log(
            "Incoming Product Data:",
            data
        );

        console.log(
            "Files:",
            files
        );


        // =================================================
        // DUPLICATE PRODUCT
        // =================================================

        const existingProduct =
            await getProductByNameDB(
                data.name
            );


        if (existingProduct) {

            throw new Error(
                "Product already exists"
            );

        }


        // =================================================
        // DUPLICATE BARCODE
        // =================================================

        if (data.barcode) {

            const barcodeExists =
                await getProductByBarcodeDB(
                    data.barcode
                );


            if (barcodeExists) {

                throw new Error(
                    "Barcode already exists"
                );

            }

        }


        // =================================================
        // CATEGORY VALIDATION
        // =================================================

        const category =
            await Category.findById(
                data.category
            );


           if (!category) {

            throw new Error(
                "Category not found"
            );

        }


        console.log(
            "PARENT CATEGORY:",
            category._id,
            category.name
        );


        // =================================================
        // SUBCATEGORY VALIDATION
        // =================================================

        let subcategory = null;

        if (data.subcategory) {

            subcategory =
                await Category.findById(
                    data.subcategory
                );

            if (!subcategory) {

                throw new Error(
                    "Subcategory not found"
                );

            }


            console.log(
                "SUBCATEGORY:",
                subcategory._id,
                subcategory.name
            );

}


        // =================================================
        // BRAND VALIDATION
        // =================================================

        const brand =
            await Brand.findById(
                data.brand
            );


        if (!brand) {

            throw new Error(
                "Brand not found"
            );

        }


        // =================================================
        // PRICING
        // =================================================
        //
        // At this point data.pricing is already an object
        // because parseProductMultipartData converted it
        // before Joi validation.
        //
        // =================================================

        const pricing = {

            purchasePrice:
                Number(
                    data.pricing?.purchasePrice ?? 0
                ),

            sellingPrice:
                Number(
                    data.pricing?.sellingPrice ?? 0
                ),

            mrp:
                Number(
                    data.pricing?.mrp ?? 0
                ),

            discount:
                Number(
                    data.pricing?.discount ?? 0
                ),

            gst:
                Number(
                    data.pricing?.gst ?? 0
                )

        };


        // =================================================
        // SLUG
        // =================================================

        const slug =
            generateSlug(
                data.name
            );


        // =================================================
        // SKU
        // =================================================

        const products =
            await getProductsDB();


        const sku =
            generateSKU(

                category.name,

                brand.name,

                products.length + 1

            );


        // =================================================
        // IMAGES
        // =================================================

        let images = [];


        if (
            files &&
            files.length > 0
        ) {

            images =
                files.map(
                    (file) => ({

                        url:
                            `/uploads/products/${file.filename}`,

                        alt:
                            data.name

                    })
                );

        }


        // =================================================
        // FINAL PRODUCT DATA
        // =================================================

        const productData = {

            name:
                data.name,

            category:
                data.category,

            subcategory: 
            data.subcategory || null,


          productType: 
           data.productType || "NEW",

            brand:
                data.brand,

            shortDescription:
                data.shortDescription || "",

            description:
                data.description || "",

            pricing,

            slug,

            sku,

            images,

            createdBy:
                userId

        };
             
        // =================================================
// REFURBISHED DETAILS
// =================================================

if (data.productType === "REFURBISHED") {

    productData.refurbishedDetails = {

        grade:
            data.refurbishedDetails?.grade || null,

        batteryHealth:
            Number(
                data.refurbishedDetails?.batteryHealth ?? 0
            ),

        warrantyMonths:
            Number(
                data.refurbishedDetails?.warrantyMonths ?? 0
            ),

        testingStatus:
            data.refurbishedDetails?.testingStatus || null

    };

}

        // =================================================
        // BARCODE
        // =================================================

        if (data.barcode) {

            productData.barcode =
                data.barcode;

        }


        // =================================================
        // SPECIFICATIONS
        // =================================================

        if (data.specifications) {

            productData.specifications =
                data.specifications;

        }


        // =================================================
        // SEO
        // =================================================

        if (data.metaTitle) {

            productData.metaTitle =
                data.metaTitle;

        }


        if (data.metaDescription) {

            productData.metaDescription =
                data.metaDescription;

        }


        // =================================================
        // STATUS
        // =================================================

        if (data.status) {

            productData.status =
                data.status;

        }


        // =================================================
        // DEBUG
        // =================================================

        console.log(
            "FINAL PRODUCT DATA:",
            productData
        );


        // =================================================
        // CREATE PRODUCT
        // =================================================

        const product =
            await createProductDB(
                productData
            );


        // =================================================
        // AUTO CREATE INVENTORY
        // =================================================

        await Inventory.create({

            product:
                product._id,

            currentStock:
                0,

            reservedStock:
                0,

            minimumStock:
                0,

            maximumStock:
                0,

            warehouseLocation:
                "",

            createdBy:
                userId

        });


        // =================================================
        // RETURN
        // =================================================

        return product;

    } catch (error) {

        console.error(
            "CREATE PRODUCT SERVICE ERROR:",
            error
        );

        throw error;

    }

};


// =====================================================
// GET PRODUCTS
// =====================================================

export const getProductsService = async () => {

    return await getProductsDB();

};


// =====================================================
// GET SINGLE PRODUCT
// =====================================================

// export const getProductService = async(id) => {

//     const product = await getProductByIdDB(id);

//     if(!product){
//         throw new Error("Product not found");
//     }

//     // Offer check
//     const offer = await getBestOfferForProduct(product);

//     const finalPricing = applyOfferOnPrice(
//         product.pricing.sellingPrice,
//         offer
//     );

//     return {
//         ...product.toObject(),
//         offer: offer || null,
//         finalPrice: finalPricing
//     };
// };

// =====================================================
// GET SINGLE PRODUCT
// =====================================================

export const getProductService = async (id) => {

    const product =
        await getProductByIdDB(id);

    if (!product) {

        throw new Error(
            "Product not found"
        );

    }


    // =================================================
    // GET ACTIVE OFFERS
    // =================================================

    const activeOffers =
        await getActiveOffersDB();


    // =================================================
    // MATCH OFFER WITH PRODUCT
    // =================================================

    const offer =
        matchOfferToProduct(
            product,
            activeOffers
        );


    // =================================================
    // CALCULATE FINAL PRICE
    // =================================================

    const finalPrice =
        calculateDiscountedPrice(
            product.pricing.sellingPrice,
            offer
        );


    // =================================================
    // RETURN PRODUCT
    // =================================================

    return {

        ...product.toObject(),

        offer:
            offer || null,

        finalPrice

    };

};
// =====================================================
// UPDATE PRODUCT
// =====================================================

export const updateProductService = async (
    id,
    data
) => {

    // =================================================
    // HANDLE FLAT PRICING
    // =================================================

    const hasFlatPricing =
        data.purchasePrice !== undefined ||
        data.sellingPrice !== undefined ||
        data.mrp !== undefined ||
        data.discount !== undefined ||
        data.gst !== undefined;


    if (hasFlatPricing) {

        data.pricing = {

            purchasePrice:
                Number(
                    data.purchasePrice || 0
                ),

            sellingPrice:
                Number(
                    data.sellingPrice || 0
                ),

            mrp:
                Number(
                    data.mrp || 0
                ),

            discount:
                Number(
                    data.discount || 0
                ),

            gst:
                Number(
                    data.gst || 0
                )

        };


        delete data.purchasePrice;

        delete data.sellingPrice;

        delete data.mrp;

        delete data.discount;

        delete data.gst;

    }


    // =================================================
    // SLUG
    // =================================================

    if (data.name) {

        data.slug =
            generateSlug(
                data.name
            );

    }


    // =================================================
    // UPDATE
    // =================================================

    const product =
        await updateProductDB(
            id,
            data
        );


    if (!product) {

        throw new Error(
            "Product not found"
        );

    }


    return product;

};


// =====================================================
// DELETE PRODUCT
// =====================================================

export const deleteProductService = async (
    id
) => {

    const product =
        await deleteProductDB(
            id
        );


    if (!product) {

        throw new Error(
            "Product not found"
        );

    }


    return product;

};


// =====================================================
// SEARCH PRODUCTS
// =====================================================

export const searchProductService = async (
    keyword
) => {

    return await searchProductsDB(
        keyword
    );

};




// =====================================================
// CUSTOMER SHOP PRODUCTS
// =====================================================

export const getShopProductsService = async () => {

    try {

        console.log(
            "======================================"
        );

        console.log(
            "GET SHOP PRODUCTS SERVICE"
        );

        console.log(
            "======================================"
        );


        // =================================================
        // GET ACTIVE PRODUCTS
        // =================================================

        const products =
            await getShopProductsDB();


        console.log(
            "SHOP PRODUCTS COUNT:",
            products.length
        );


        // =================================================
        // GET ACTIVE OFFERS
        // =================================================

        const activeOffers =
            await getActiveOffersDB();


        console.log(
            "ACTIVE OFFERS COUNT:",
            activeOffers.length
        );


        // =================================================
        // APPLY OFFERS
        // =================================================

        const productsWithOffers =
            products.map((product) => {

                // -------------------------------------------------
                // Product is normally a mongoose document here.
                // Keep fallback so this function remains safe even
                // if repository ever returns plain objects.
                // -------------------------------------------------

                const productData =
                    typeof product.toObject === "function"
                        ? product.toObject()
                        : product;


                // -------------------------------------------------
                // Find matching offer
                // -------------------------------------------------

                const offer =
                    matchOfferToProduct(
                        productData,
                        activeOffers
                    );


                // -------------------------------------------------
                // Calculate final customer price
                // -------------------------------------------------

                const sellingPrice =
                    Number(
                        productData.pricing?.sellingPrice || 0
                    );


                const finalPrice =
                    calculateDiscountedPrice(
                        sellingPrice,
                        offer
                    );


                // -------------------------------------------------
                // Return product
                // -------------------------------------------------

                return {

                    ...productData,

                    offer:
                        offer || null,

                    finalPrice

                };

            });


        console.log(
            "FINAL SHOP PRODUCTS:",
            productsWithOffers.length
        );


        return productsWithOffers;


    } catch (error) {

        console.error(
            "GET SHOP PRODUCTS SERVICE ERROR:",
            error
        );

        throw error;

    }

};